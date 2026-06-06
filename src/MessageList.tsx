import { Fragment } from "react";
import type { ChatMessage } from "./types";
import { formatDayLabel, groupByAuthor, isSameDay } from "./helpers";
import { MessageBubble } from "./MessageBubble";
import { Avatar } from "./Avatar";
import { TypingIndicator } from "./TypingIndicator";

/** Props for {@link MessageList}. */
export interface MessageListProps {
  /** Messages to render, in chronological order. */
  messages: ChatMessage[];
  /** Toggle per-bubble timestamps. Default `true`. */
  showTimestamps?: boolean;
  /** Toggle per-bubble delivery status ticks. Default `true`. */
  showStatus?: boolean;
  /** Show an avatar beside each author run. Default `true`. */
  showAvatars?: boolean;
  /** Insert "Today / Yesterday / date" separators between days. Default `true`. */
  showDateSeparators?: boolean;
  /** Render message content as plain text instead of markdown. Default `false`. */
  plainText?: boolean;
  /** When set, render a typing indicator at the end of the log. */
  typing?: boolean;
  /** Name(s) shown in the typing indicator. */
  typingWho?: string | string[];
  /** Node shown when `messages` is empty. */
  emptyState?: React.ReactNode;
  /** Extra class names appended to the root element. */
  className?: string;
}

/**
 * Renders messages grouped into author runs (via {@link groupByAuthor}) so a
 * name header and avatar appear once per run. Optionally inserts day
 * separators and a trailing typing indicator. Bubbles keep their own
 * alignment.
 */
export function MessageList({
  messages,
  showTimestamps = true,
  showStatus = true,
  showAvatars = true,
  showDateSeparators = true,
  plainText = false,
  typing = false,
  typingWho,
  emptyState = null,
  className,
}: MessageListProps): JSX.Element {
  const rootClass = ["rcui-list", className].filter(Boolean).join(" ");

  if (messages.length === 0 && !typing) {
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
      {groups.map((group, index) => {
        const first = group.messages[0];
        const prevGroup = groups[index - 1];
        const prevTs = prevGroup?.messages[prevGroup.messages.length - 1]
          ?.timestamp;
        const needsSeparator =
          showDateSeparators &&
          (prevTs == null || !isSameDay(prevTs, first.timestamp));
        const showName = Boolean(group.author) && group.role !== "system";
        const showAvatar =
          showAvatars && group.role !== "system";

        return (
          <Fragment key={first.id ?? index}>
            {needsSeparator && (
              <div
                className="rcui-separator"
                role="separator"
                data-testid={`separator-${index}`}
                style={{ textAlign: "center" }}
              >
                <span className="rcui-separator__label">
                  {formatDayLabel(first.timestamp)}
                </span>
              </div>
            )}
            <div
              className={`rcui-group rcui-group--${group.role}`}
              data-testid={`group-${index}`}
              style={{
                display: "flex",
                gap: 8,
                flexDirection: group.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-end",
              }}
            >
              {showAvatar && (
                <Avatar name={group.author} src={group.avatarUrl} />
              )}
              <div
                className="rcui-group__body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {showName && (
                  <span className="rcui-group__author">{group.author}</span>
                )}
                {group.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    showTimestamp={showTimestamps}
                    showStatus={showStatus}
                    plainText={plainText}
                  />
                ))}
              </div>
            </div>
          </Fragment>
        );
      })}

      {typing && (
        <div
          className="rcui-group rcui-group--assistant rcui-group--typing"
          style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
        >
          {showAvatars && (
            <Avatar
              name={typeof typingWho === "string" ? typingWho : undefined}
            />
          )}
          <TypingIndicator who={typingWho} />
        </div>
      )}
    </div>
  );
}
