import { useState, type FormEvent, type KeyboardEvent } from "react";

/** Props for {@link ChatInput}. */
export interface ChatInputProps {
  /**
   * Called with the trimmed text when the user submits a non-empty message.
   * Blank / whitespace-only input is ignored and `onSend` is not called.
   */
  onSend: (text: string) => void;
  /** Placeholder shown in the empty textarea. */
  placeholder?: string;
  /** Disable input and the send button. */
  disabled?: boolean;
  /** Label for the submit button. Default `"Send"`. */
  sendLabel?: string;
  /** Extra class names appended to the root form. */
  className?: string;
}

/**
 * Controlled chat composer. Submitting (button click, form submit, or Enter
 * without Shift) fires `onSend(trimmedText)` and clears the field. Shift+Enter
 * inserts a newline instead of sending.
 */
export function ChatInput({
  onSend,
  placeholder = "Type a message...",
  disabled = false,
  sendLabel = "Send",
  className,
}: ChatInputProps): JSX.Element {
  const [value, setValue] = useState("");

  const submit = (): void => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || disabled) return;
    onSend(trimmed);
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
      style={{ display: "flex", gap: 8 }}
    >
      <textarea
        className="rcui-input__field"
        aria-label="Message"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        rows={1}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        style={{ flex: 1, resize: "none" }}
      />
      <button
        type="submit"
        className="rcui-input__send"
        disabled={disabled || value.trim().length === 0}
      >
        {sendLabel}
      </button>
    </form>
  );
}
