/**
 * Role of a chat message author. Drives bubble alignment and styling.
 * - `user`: the local participant (right-aligned by default).
 * - `assistant`: a bot / AI / agent reply (left-aligned by default).
 * - `system`: meta information such as "User joined" (centered by default).
 */
export type ChatRole = "user" | "assistant" | "system";

/** A single chat message. */
export interface ChatMessage {
  /** Stable unique identifier used as the React key. */
  id: string;
  /** Logical author role. Controls styling and grouping. */
  role: ChatRole;
  /** Plain-text message body. */
  content: string;
  /** Unix epoch milliseconds the message was created. */
  timestamp: number;
  /** Optional display name shown above a group of messages. */
  author?: string;
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
  /** Ordered messages belonging to this group. */
  messages: ChatMessage[];
}
