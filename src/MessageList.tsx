import type { ChatMessage } from "./types";
import { groupByAuthor } from "./helpers";
import { MessageBubble } from "./MessageBubble";

/** Props for {@link MessageList}. */
export interface MessageListProps {
  /** Messages to render, in chronological order. */
  messages: ChatMessage[];
  /** Toggle per-bubble timestamps. Default `true`. */
  showTimestamps?: boolean;
  /** Node shown when `messages` is empty. */
  emptyState?: React.ReactNode;
  /** Extra class names appended to the root element. */
  className?: string;
}

/**
 * Renders messages grouped into author runs (via {@link groupByAuthor}) so a
 * name header appears once per run. Bubbles keep their own alignment.
 */
export function MessageList({
  messages,
  showTimestamps = true,
  emptyState = null,
  className,
}: MessageListProps): JSX.Element {
  const rootClass = ["rcui-list", className].filter(Boolean).join(" ");

  if (messages.length === 0) {
    return (
      <div className={rootClass} role="log" aria-live="polite">
        {emptyState}
      </div>
    );
  }

  const groups = groupByAuthor(messages);

  return (
    <div
      className={rootClass}
      role="log"
      aria-live="polite"
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      {groups.map((group, index) => (
        <div
          key={group.messages[0].id ?? index}
          className={`rcui-group rcui-group--${group.role}`}
          data-testid={`group-${index}`}
          style={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {group.author && group.role !== "system" && (
            <span className="rcui-group__author">{group.author}</span>
          )}
          {group.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              showTimestamp={showTimestamps}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
