import type { ChatMessage, MessageGroup } from "./types";

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
