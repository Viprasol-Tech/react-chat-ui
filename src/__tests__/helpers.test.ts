import { describe, it, expect } from "vitest";
import { groupByAuthor, formatTimestamp } from "../helpers";
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
