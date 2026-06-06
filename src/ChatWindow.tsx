import type { ReactNode } from "react";
import type { ChatMessage } from "./types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

/** Props for {@link ChatWindow}. */
export interface ChatWindowProps {
  /** Messages to display, chronological order. */
  messages: ChatMessage[];
  /** Called with trimmed text when the composer submits. */
  onSend: (text: string) => void;
  /** Optional header node rendered above the message list. */
  header?: ReactNode;
  /** Placeholder for the composer. */
  placeholder?: string;
  /** Disable the composer (e.g. while awaiting a reply). */
  disabled?: boolean;
  /** Toggle per-bubble timestamps. Default `true`. */
  showTimestamps?: boolean;
  /** Node shown when there are no messages. */
  emptyState?: ReactNode;
  /** Extra class names appended to the root element. */
  className?: string;
}

/**
 * Full chat surface composing {@link MessageList} and {@link ChatInput} into a
 * column layout: optional header, scrollable message log, then the composer.
 */
export function ChatWindow({
  messages,
  onSend,
  header,
  placeholder,
  disabled,
  showTimestamps = true,
  emptyState,
  className,
}: ChatWindowProps): JSX.Element {
  const rootClass = ["rcui-window", className].filter(Boolean).join(" ");

  return (
    <div
      className={rootClass}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {header != null && <div className="rcui-window__header">{header}</div>}
      <div
        className="rcui-window__body"
        style={{ flex: 1, overflowY: "auto" }}
      >
        <MessageList
          messages={messages}
          showTimestamps={showTimestamps}
          emptyState={emptyState}
        />
      </div>
      <div className="rcui-window__footer">
        <ChatInput
          onSend={onSend}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
