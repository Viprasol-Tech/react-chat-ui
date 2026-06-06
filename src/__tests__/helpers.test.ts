import { describe, it, expect } from "vitest";
import {
  groupByAuthor,
  formatTimestamp,
  getInitials,
  formatBytes,
  isSameDay,
  formatDayLabel,
  statusLabel,
  statusGlyph,
  parseInlineMarkdown,
} from "../helpers";
import type { ChatMessage } from "../types";

const msg = (over: Partial<ChatMessage>): ChatMessage => ({
  id: Math.random().toString(36).slice(2),
  role: "user",
  content: "hi",
  timestamp: 0,
  ...over,
});

describe("groupByAuthor", () => {
  it("returns no groups for an empty list", () => {
    expect(groupByAuthor([])).toEqual([]);
  });

  it("merges consecutive messages with the same role and author", () => {
    const messages = [
      msg({ id: "1", role: "user", author: "Ada" }),
      msg({ id: "2", role: "user", author: "Ada" }),
      msg({ id: "3", role: "assistant", author: undefined }),
    ];
    const groups = groupByAuthor(messages);
    expect(groups).toHaveLength(2);
    expect(groups[0].messages.map((m) => m.id)).toEqual(["1", "2"]);
    expect(groups[0].role).toBe("user");
    expect(groups[0].author).toBe("Ada");
    expect(groups[1].messages.map((m) => m.id)).toEqual(["3"]);
  });

  it("starts a new group when the author changes but role stays", () => {
    const messages = [
      msg({ id: "1", role: "user", author: "Ada" }),
      msg({ id: "2", role: "user", author: "Bob" }),
    ];
    const groups = groupByAuthor(messages);
    expect(groups).toHaveLength(2);
    expect(groups[0].author).toBe("Ada");
    expect(groups[1].author).toBe("Bob");
  });

  it("does not merge non-adjacent same-author runs", () => {
    const messages = [
      msg({ id: "1", role: "user", author: "Ada" }),
      msg({ id: "2", role: "assistant" }),
      msg({ id: "3", role: "user", author: "Ada" }),
    ];
    const groups = groupByAuthor(messages);
    expect(groups).toHaveLength(3);
  });

  it("carries the avatar of the first message into the group", () => {
    const messages = [
      msg({ id: "1", role: "user", author: "Ada", avatarUrl: "a.png" }),
      msg({ id: "2", role: "user", author: "Ada" }),
    ];
    const groups = groupByAuthor(messages);
    expect(groups).toHaveLength(1);
    expect(groups[0].avatarUrl).toBe("a.png");
  });

  it("does not mutate the input array", () => {
    const messages = [msg({ id: "1" }), msg({ id: "2" })];
    const snapshot = [...messages];
    groupByAuthor(messages);
    expect(messages).toEqual(snapshot);
  });
});

describe("formatTimestamp", () => {
  it("formats as zero-padded HH:MM in local time", () => {
    const d = new Date(2024, 0, 1, 9, 5, 0);
    expect(formatTimestamp(d.getTime())).toBe("09:05");
  });

  it("handles two-digit hours and minutes", () => {
    const d = new Date(2024, 0, 1, 23, 45, 0);
    expect(formatTimestamp(d.getTime())).toBe("23:45");
  });

  it("returns empty string for non-finite input", () => {
    expect(formatTimestamp(Number.NaN)).toBe("");
    expect(formatTimestamp(Number.POSITIVE_INFINITY)).toBe("");
  });
});

describe("getInitials", () => {
  it("uses first and last word initials", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
    expect(getInitials("Grace B Hopper")).toBe("GH");
  });

  it("uses a single initial for one-word names", () => {
    expect(getInitials("madonna")).toBe("M");
  });

  it("falls back to ? for empty / whitespace / undefined", () => {
    expect(getInitials(undefined)).toBe("?");
    expect(getInitials("")).toBe("?");
    expect(getInitials("   ")).toBe("?");
  });
});

describe("formatBytes", () => {
  it("formats bytes, KB, MB", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB");
  });

  it("returns empty string for invalid input", () => {
    expect(formatBytes(-1)).toBe("");
    expect(formatBytes(Number.NaN)).toBe("");
  });
});

describe("isSameDay", () => {
  it("is true within the same calendar day", () => {
    const a = new Date(2024, 5, 1, 1, 0).getTime();
    const b = new Date(2024, 5, 1, 23, 0).getTime();
    expect(isSameDay(a, b)).toBe(true);
  });

  it("is false across day boundaries", () => {
    const a = new Date(2024, 5, 1, 23, 59).getTime();
    const b = new Date(2024, 5, 2, 0, 1).getTime();
    expect(isSameDay(a, b)).toBe(false);
  });

  it("is false for non-finite input", () => {
    expect(isSameDay(Number.NaN, 0)).toBe(false);
  });
});

describe("formatDayLabel", () => {
  const now = new Date(2024, 5, 15, 12, 0).getTime();

  it("labels today and yesterday", () => {
    expect(formatDayLabel(new Date(2024, 5, 15, 8, 0).getTime(), now)).toBe(
      "Today"
    );
    expect(formatDayLabel(new Date(2024, 5, 14, 8, 0).getTime(), now)).toBe(
      "Yesterday"
    );
  });

  it("uses a localized date for older days", () => {
    const label = formatDayLabel(new Date(2024, 0, 1).getTime(), now);
    expect(label).not.toBe("Today");
    expect(label).not.toBe("Yesterday");
    expect(label.length).toBeGreaterThan(0);
  });

  it("returns empty string for non-finite input", () => {
    expect(formatDayLabel(Number.NaN, now)).toBe("");
  });
});

describe("statusLabel / statusGlyph", () => {
  it("returns a label for every status", () => {
    expect(statusLabel("sending")).toBe("Sending");
    expect(statusLabel("sent")).toBe("Sent");
    expect(statusLabel("delivered")).toBe("Delivered");
    expect(statusLabel("read")).toBe("Read");
    expect(statusLabel("error")).toBe("Failed to send");
  });

  it("returns a glyph for every status", () => {
    expect(statusGlyph("sent")).toBe("✓");
    expect(statusGlyph("delivered")).toBe("✓✓");
    expect(statusGlyph("read")).toBe("✓✓");
    expect(statusGlyph("error")).toBe("⚠");
    expect(statusGlyph("sending").length).toBeGreaterThan(0);
  });
});

describe("parseInlineMarkdown", () => {
  it("returns empty array for empty input", () => {
    expect(parseInlineMarkdown("")).toEqual([]);
  });

  it("returns a single text token for plain text", () => {
    expect(parseInlineMarkdown("just text")).toEqual([
      { type: "text", value: "just text" },
    ]);
  });

  it("parses bold, italic and code", () => {
    expect(parseInlineMarkdown("a **b** c")).toEqual([
      { type: "text", value: "a " },
      { type: "bold", value: "b" },
      { type: "text", value: " c" },
    ]);
    expect(parseInlineMarkdown("*i*")).toEqual([{ type: "italic", value: "i" }]);
    expect(parseInlineMarkdown("`x`")).toEqual([{ type: "code", value: "x" }]);
  });

  it("parses safe http and mailto links", () => {
    expect(parseInlineMarkdown("[site](https://x.io)")).toEqual([
      { type: "link", value: "site", href: "https://x.io" },
    ]);
    expect(parseInlineMarkdown("[me](mailto:a@b.com)")).toEqual([
      { type: "link", value: "me", href: "mailto:a@b.com" },
    ]);
  });

  it("does not treat javascript: links as links (XSS-safe)", () => {
    const tokens = parseInlineMarkdown("[x](javascript:alert(1))");
    expect(tokens.every((t) => t.type === "text")).toBe(true);
  });

  it("emits raw angle brackets as plain text (never HTML)", () => {
    expect(parseInlineMarkdown("<b>hi</b>")).toEqual([
      { type: "text", value: "<b>hi</b>" },
    ]);
  });
});
