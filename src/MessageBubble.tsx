import type { CSSProperties } from "react";
import type { ChatMessage } from "./types";
import { formatTimestamp } from "./helpers";

/** Props for {@link MessageBubble}. */
export interface MessageBubbleProps {
  /** The message to render. */
  message: ChatMessage;
  /** Hide the timestamp label when `false`. Default `true`. */
  showTimestamp?: boolean;
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
 * inspecting children.
 */
export function MessageBubble({
  message,
  showTimestamp = true,
  className,
}: MessageBubbleProps): JSX.Element {
  const rootClass = ["rcui-bubble", `rcui-bubble--${message.role}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClass}
      data-role={message.role}
      data-testid={`bubble-${message.id}`}
      style={{ alignSelf: ALIGN[message.role], maxWidth: "75%" }}
    >
      <div className="rcui-bubble__content">{message.content}</div>
      {showTimestamp && (
        <time
          className="rcui-bubble__time"
          dateTime={new Date(message.timestamp).toISOString()}
        >
          {formatTimestamp(message.timestamp)}
        </time>
      )}
    </div>
  );
}
