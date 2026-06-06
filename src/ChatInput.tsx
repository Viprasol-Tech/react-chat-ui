import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { ChatAttachment } from "./types";

/** Props for {@link ChatInput}. */
export interface ChatInputProps {
  /**
   * Called with the trimmed text when the user submits a non-empty message.
   * Blank / whitespace-only input is ignored UNLESS attachments are staged.
   */
  onSend: (text: string) => void;
  /** Placeholder shown in the empty textarea. */
  placeholder?: string;
  /** Disable input and the send button. */
  disabled?: boolean;
  /** Label for the submit button. Default `"Send"`. */
  sendLabel?: string;
  /** Maximum characters; shows a counter when set. */
  maxLength?: number;
  /**
   * When provided, an attachment button is rendered. Receives the picked
   * `FileList` so the consumer can upload and stage attachments.
   */
  onAttach?: (files: FileList) => void;
  /** `accept` attribute for the hidden file input. Default accepts all files. */
  accept?: string;
  /** Staged attachments to display as removable chips above the field. */
  pendingAttachments?: ChatAttachment[];
  /** Remove a staged attachment by id. */
  onRemoveAttachment?: (id: string) => void;
  /** Extra class names appended to the root form. */
  className?: string;
}

/**
 * Controlled chat composer. Submitting (button click, form submit, or Enter
 * without Shift) fires `onSend(trimmedText)` and clears the field. Shift+Enter
 * inserts a newline. Supports an optional attachment picker and a staged-chip
 * row; with staged attachments, an empty text body can still be sent.
 */
export function ChatInput({
  onSend,
  placeholder = "Type a message...",
  disabled = false,
  sendLabel = "Send",
  maxLength,
  onAttach,
  accept = "*/*",
  pendingAttachments = [],
  onRemoveAttachment,
  className,
}: ChatInputProps): JSX.Element {
  const [value, setValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const hasAttachments = pendingAttachments.length > 0;
  const canSend = value.trim().length > 0 || hasAttachments;

  const submit = (): void => {
    if (disabled || !canSend) return;
    onSend(value.trim());
    setValue("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const rootClass = ["rcui-input", className].filter(Boolean).join(" ");

  return (
    <form
      className={rootClass}
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      {hasAttachments && (
        <div
          className="rcui-input__chips"
          data-testid="input-chips"
          style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
        >
          {pendingAttachments.map((attachment) => (
            <span
              key={attachment.id}
              className="rcui-input__chip"
              data-testid={`chip-${attachment.id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <span className="rcui-input__chip-name">{attachment.name}</span>
              {onRemoveAttachment && (
                <button
                  type="button"
                  className="rcui-input__chip-remove"
                  aria-label={`Remove ${attachment.name}`}
                  onClick={() => onRemoveAttachment(attachment.id)}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="rcui-input__row" style={{ display: "flex", gap: 8 }}>
        {onAttach && (
          <>
            <button
              type="button"
              className="rcui-input__attach"
              aria-label="Attach files"
              disabled={disabled}
              onClick={() => fileRef.current?.click()}
            >
              📎
            </button>
            <input
              ref={fileRef}
              type="file"
              className="rcui-input__file"
              accept={accept}
              multiple
              hidden
              aria-hidden="true"
              tabIndex={-1}
              data-testid="input-file"
              onChange={(event) => {
                const { files } = event.target;
                if (files && files.length > 0) onAttach(files);
                event.target.value = "";
              }}
            />
          </>
        )}
        <textarea
          className="rcui-input__field"
          aria-label="Message"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          rows={1}
          maxLength={maxLength}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, resize: "none" }}
        />
        <button
          type="submit"
          className="rcui-input__send"
          disabled={disabled || !canSend}
        >
          {sendLabel}
        </button>
      </div>

      {maxLength != null && (
        <span
          className="rcui-input__counter"
          data-testid="input-counter"
          style={{ alignSelf: "flex-end", fontSize: 12 }}
        >
          {value.length}/{maxLength}
        </span>
      )}
    </form>
  );
}
