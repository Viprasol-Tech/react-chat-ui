import { useEffect, useRef, type ReactNode } from "react";
import type { ChatAttachment, ChatMessage } from "./types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

/** Props for {@link ChatWindow}. */
export interface ChatWindowProps {
  /** Messages to display, chronological order. */
  messages: ChatMessage[];
  /** Called with trimmed text when the composer submits. */
  onSend: (text: string) => void;
  /** Called when the user picks files in the composer, if attachments enabled. */
  onAttach?: (files: FileList) => void;
  /** Optional header node rendered above the message list. */
  header?: ReactNode;
  /** Placeholder for the composer. */
  placeholder?: string;
  /** Disable the composer (e.g. while awaiting a reply). */
  disabled?: boolean;
  /** Toggle per-bubble timestamps. Default `true`. */
  showTimestamps?: boolean;
  /** Toggle per-bubble delivery status ticks. Default `true`. */
  showStatus?: boolean;
  /** Toggle author avatars. Default `true`. */
  showAvatars?: boolean;
  /** Toggle "Today / Yesterday" date separators. Default `true`. */
  showDateSeparators?: boolean;
  /** Render content as plain text instead of safe markdown. Default `false`. */
  plainText?: boolean;
  /** Show a typing indicator at the end of the log. */
  typing?: boolean;
  /** Name(s) shown in the typing indicator. */
  typingWho?: string | string[];
  /** Auto-scroll to the newest message on update. Default `true`. */
  autoScroll?: boolean;
  /** Attachments staged in the composer (controlled chip row). */
  pendingAttachments?: ChatAttachment[];
  /** Remove a staged attachment by id. */
  onRemoveAttachment?: (id: string) => void;
  /** Node shown when there are no messages. */
  emptyState?: ReactNode;
  /** Extra class names appended to the root element. */
  className?: string;
}

/**
 * Full chat surface composing {@link MessageList} and {@link ChatInput} into a
 * column layout: optional header, scrollable message log, then the composer.
 * Auto-scrolls to the newest message when `messages` / `typing` change unless
 * `autoScroll` is `false`.
 */
export function ChatWindow({
  messages,
  onSend,
  onAttach,
  header,
  placeholder,
  disabled,
  showTimestamps = true,
  showStatus = true,
  showAvatars = true,
  showDateSeparators = true,
  plainText = false,
  typing = false,
  typingWho,
  autoScroll = true,
  pendingAttachments,
  onRemoveAttachment,
  emptyState,
  className,
}: ChatWindowProps): JSX.Element {
  const rootClass = ["rcui-window", className].filter(Boolean).join(" ");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScroll) return;
    const node = bodyRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [autoScroll, messages, typing]);

  return (
    <div
      className={rootClass}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {header != null && <div className="rcui-window__header">{header}</div>}
      <div
        ref={bodyRef}
        className="rcui-window__body"
        data-testid="rcui-window-body"
        style={{ flex: 1, overflowY: "auto" }}
      >
        <MessageList
          messages={messages}
          showTimestamps={showTimestamps}
          showStatus={showStatus}
          showAvatars={showAvatars}
          showDateSeparators={showDateSeparators}
          plainText={plainText}
          typing={typing}
          typingWho={typingWho}
          emptyState={emptyState}
        />
      </div>
      <div className="rcui-window__footer">
        <ChatInput
          onSend={onSend}
          onAttach={onAttach}
          placeholder={placeholder}
          disabled={disabled}
          pendingAttachments={pendingAttachments}
          onRemoveAttachment={onRemoveAttachment}
        />
      </div>
    </div>
  );
}
