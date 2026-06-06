export { ChatWindow } from "./ChatWindow";
export type { ChatWindowProps } from "./ChatWindow";

export { MessageList } from "./MessageList";
export type { MessageListProps } from "./MessageList";

export { MessageBubble } from "./MessageBubble";
export type { MessageBubbleProps } from "./MessageBubble";

export { ChatInput } from "./ChatInput";
export type { ChatInputProps } from "./ChatInput";

export { Avatar } from "./Avatar";
export type { AvatarProps } from "./Avatar";

export { Attachment } from "./Attachment";
export type { AttachmentProps } from "./Attachment";

export { TypingIndicator } from "./TypingIndicator";
export type { TypingIndicatorProps } from "./TypingIndicator";

export { MarkdownText } from "./MarkdownText";
export type { MarkdownTextProps } from "./MarkdownText";

export {
  groupByAuthor,
  formatTimestamp,
  getInitials,
  formatBytes,
  isSameDay,
  formatDayLabel,
  statusLabel,
  statusGlyph,
  parseInlineMarkdown,
} from "./helpers";

export type {
  ChatMessage,
  ChatRole,
  MessageGroup,
  MessageStatus,
  ChatAttachment,
  MarkdownToken,
} from "./types";
