import type {
  ChatMessage,
  MarkdownToken,
  MessageGroup,
  MessageStatus,
} from "./types";

/**
 * Group consecutive messages that share the same `role` AND `author` into
 * runs. A new group starts whenever either field differs from the previous
 * message. Order is preserved; the input array is never mutated.
 *
 * @example
 * groupByAuthor([
 *   { id: "1", role: "user", author: "Ada", content: "hi", timestamp: 0 },
 *   { id: "2", role: "user", author: "Ada", content: "there", timestamp: 1 },
 *   { id: "3", role: "assistant", content: "hello", timestamp: 2 },
 * ]);
 * // => 2 groups: [Ada x2], [assistant x1]
 */
export function groupByAuthor(messages: ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];

  for (const message of messages) {
    const last = groups[groups.length - 1];
    if (last && last.role === message.role && last.author === message.author) {
      last.messages.push(message);
    } else {
      groups.push({
        role: message.role,
        author: message.author,
        avatarUrl: message.avatarUrl,
        messages: [message],
      });
    }
  }

  return groups;
}

/** Left-pad a number to two digits (e.g. `7` -> `"07"`). */
function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * Format a Unix-epoch-millisecond timestamp as a 24-hour `HH:MM` clock label.
 * Uses the host's local time zone. Invalid (non-finite) input returns `""`.
 *
 * @example formatTimestamp(0) // depends on TZ, e.g. "00:00"
 */
export function formatTimestamp(ts: number): string {
  if (!Number.isFinite(ts)) return "";
  const date = new Date(ts);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/**
 * Compute up to two uppercase initials from a name.
 * Falls back to `"?"` for empty / whitespace-only input.
 *
 * @example getInitials("Ada Lovelace") // "AL"
 * @example getInitials("madonna")      // "M"
 */
export function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Render a byte count as a short human-readable string.
 * Negative or non-finite input returns `""`.
 *
 * @example formatBytes(0)       // "0 B"
 * @example formatBytes(1536)    // "1.5 KB"
 * @example formatBytes(5242880) // "5 MB"
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${units[unit]}`;
}

/** Whether two epoch-ms timestamps fall on the same local calendar day. */
export function isSameDay(a: number, b: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/**
 * Format an epoch-ms timestamp as a day separator label relative to `now`:
 * `"Today"`, `"Yesterday"`, or a localized date. Non-finite input returns `""`.
 */
export function formatDayLabel(ts: number, now: number = Date.now()): string {
  if (!Number.isFinite(ts)) return "";
  if (isSameDay(ts, now)) return "Today";
  const yesterday = now - 24 * 60 * 60 * 1000;
  if (isSameDay(ts, yesterday)) return "Yesterday";
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Short, accessible label for a delivery {@link MessageStatus}. */
export function statusLabel(status: MessageStatus): string {
  switch (status) {
    case "sending":
      return "Sending";
    case "sent":
      return "Sent";
    case "delivered":
      return "Delivered";
    case "read":
      return "Read";
    case "error":
      return "Failed to send";
  }
}

/** Compact glyph for a delivery {@link MessageStatus}, e.g. for a tick row. */
export function statusGlyph(status: MessageStatus): string {
  switch (status) {
    case "sending":
      return "···"; // ···
    case "sent":
      return "✓"; // ✓
    case "delivered":
      return "✓✓"; // ✓✓
    case "read":
      return "✓✓"; // ✓✓ (consumers can color this differently)
    case "error":
      return "⚠"; // ⚠
  }
}

const TOKEN_RE =
  /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)|(\[[^\]]+\]\((?:https?:\/\/|mailto:)[^\s)]+\))/g;

/**
 * Parse a string into a flat list of safe inline-markdown tokens. Supports
 * `**bold**`, `*italic*`, `` `code` ``, and `[label](href)` links restricted
 * to `http(s):` / `mailto:` schemes. Anything else is emitted as plain text,
 * so the output is XSS-safe by construction (no raw HTML is ever produced).
 *
 * @example
 * parseInlineMarkdown("hi **there**")
 * // [{type:"text",value:"hi "},{type:"bold",value:"there"}]
 */
export function parseInlineMarkdown(input: string): MarkdownToken[] {
  if (!input) return [];
  const tokens: MarkdownToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: input.slice(lastIndex, match.index) });
    }
    const [whole, bold, italic, code, link] = match;
    if (bold) {
      tokens.push({ type: "bold", value: bold.slice(2, -2) });
    } else if (italic) {
      tokens.push({ type: "italic", value: italic.slice(1, -1) });
    } else if (code) {
      tokens.push({ type: "code", value: code.slice(1, -1) });
    } else if (link) {
      const sep = link.indexOf("](");
      const label = link.slice(1, sep);
      const href = link.slice(sep + 2, -1);
      tokens.push({ type: "link", value: label, href });
    }
    lastIndex = match.index + whole.length;
  }

  if (lastIndex < input.length) {
    tokens.push({ type: "text", value: input.slice(lastIndex) });
  }

  return tokens;
}
