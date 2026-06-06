import type { CSSProperties } from "react";
import type { ChatMessage } from "./types";
import { formatTimestamp, statusGlyph, statusLabel } from "./helpers";
import { MarkdownText } from "./MarkdownText";
import { Attachment } from "./Attachment";

/** Props for {@link MessageBubble}. */
export interface MessageBubbleProps {
  /** The message to render. */
  message: ChatMessage;
  /** Hide the timestamp label when `false`. Default `true`. */
  showTimestamp?: boolean;
  /** Hide the delivery status tick when `false`. Default `true`. */
  showStatus?: boolean;
  /** Render `content` as plain text instead of safe markdown. Default `false`. */
  plainText?: boolean;
  /** Extra class names appended to the root element. */
  className?: string;
}

const ALIGN: Record<ChatMessage["role"], CSSProperties["alignSelf"]> = {
  user: "flex-end",
  assistant: "flex-start",
  system: "center",
};

/**
 * A single chat bubble. The `data-role` attribute and `rcui-bubble--<role>`
 * class let consumers target user / assistant / system styling without
 * inspecting children. Renders safe inline markdown, attachments, a timestamp,
 * and (for messages with a `status`) a delivery tick.
 */
export function MessageBubble({
  message,
  showTimestamp = true,
  showStatus = true,
  plainText = false,
  className,
}: MessageBubbleProps): JSX.Element {
  const rootClass = ["rcui-bubble", `rcui-bubble--${message.role}`, className]
    .filter(Boolean)
    .join(" ");
  const hasStatus = showStatus && message.status != null;
  const attachments = message.attachments ?? [];

  return (
    <div
      className={rootClass}
      data-role={message.role}
      data-status={message.status}
      data-testid={`bubble-${message.id}`}
      style={{ alignSelf: ALIGN[message.role], maxWidth: "75%" }}
    >
      {message.content.length > 0 && (
        <div className="rcui-bubble__content">
          {plainText ? message.content : <MarkdownText text={message.content} />}
        </div>
      )}

      {attachments.length > 0 && (
        <div
          className="rcui-bubble__attachments"
          style={{ display: "flex", flexDirection: "column", gap: 4 }}
        >
          {attachments.map((attachment) => (
            <Attachment key={attachment.id} attachment={attachment} />
          ))}
        </div>
      )}

      <div
        className="rcui-bubble__meta"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          justifyContent: "flex-end",
        }}
      >
        {showTimestamp && (
          <time
            className="rcui-bubble__time"
            dateTime={new Date(message.timestamp).toISOString()}
          >
            {formatTimestamp(message.timestamp)}
          </time>
        )}
        {hasStatus && message.status != null && (
          <span
            className={`rcui-bubble__status rcui-bubble__status--${message.status}`}
            data-testid={`status-${message.id}`}
            title={statusLabel(message.status)}
            aria-label={statusLabel(message.status)}
            role="img"
          >
            {statusGlyph(message.status)}
          </span>
        )}
      </div>
    </div>
  );
}
