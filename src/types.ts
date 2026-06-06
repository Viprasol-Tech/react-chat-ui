/**
 * Role of a chat message author. Drives bubble alignment and styling.
 * - `user`: the local participant (right-aligned by default).
 * - `assistant`: a bot / AI / agent reply (left-aligned by default).
 * - `system`: meta information such as "User joined" (centered by default).
 */
export type ChatRole = "user" | "assistant" | "system";

/**
 * Delivery lifecycle of an outgoing message, rendered as a status tick.
 * - `sending`: optimistic, not yet acknowledged by the server.
 * - `sent`: accepted by the server.
 * - `delivered`: reached the recipient's device.
 * - `read`: seen by the recipient.
 * - `error`: failed to send (offer a retry affordance).
 */
export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "error";

/** A file or media attachment carried by a {@link ChatMessage}. */
export interface ChatAttachment {
  /** Stable unique identifier used as the React key. */
  id: string;
  /** High-level kind. Drives which preview is rendered. */
  kind: "image" | "file";
  /** Display name, e.g. `"invoice.pdf"`. */
  name: string;
  /** Resource URL (image src or download href). */
  url: string;
  /** Size in bytes, used to render a human-readable label. */
  size?: number;
  /** MIME type, e.g. `"image/png"`. */
  mimeType?: string;
}

/** A single chat message. */
export interface ChatMessage {
  /** Stable unique identifier used as the React key. */
  id: string;
  /** Logical author role. Controls styling and grouping. */
  role: ChatRole;
  /** Plain-text message body (rendered with safe inline markdown). */
  content: string;
  /** Unix epoch milliseconds the message was created. */
  timestamp: number;
  /** Optional display name shown above a group of messages. */
  author?: string;
  /** Optional avatar URL shown beside a group of messages. */
  avatarUrl?: string;
  /** Delivery status, typically only meaningful for `user` messages. */
  status?: MessageStatus;
  /** Optional file / media attachments. */
  attachments?: ChatAttachment[];
}

/**
 * A run of consecutive messages that share the same author/role.
 * Produced by {@link groupByAuthor} so the UI can render one avatar /
 * name header per run instead of repeating it on every bubble.
 */
export interface MessageGroup {
  /** Role shared by every message in this group. */
  role: ChatRole;
  /** Author name shared by the group, if any. */
  author?: string;
  /** Avatar URL shared by the group, if any. */
  avatarUrl?: string;
  /** Ordered messages belonging to this group. */
  messages: ChatMessage[];
}

/** A token produced by {@link parseInlineMarkdown}. */
export type MarkdownToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; value: string; href: string };
