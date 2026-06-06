/** Props for {@link TypingIndicator}. */
export interface TypingIndicatorProps {
  /**
   * Name(s) of who is typing. A string, a list of names, or omitted for a
   * generic indicator. Drives the accessible label.
   */
  who?: string | string[];
  /** Extra class names appended to the root element. */
  className?: string;
}

function buildLabel(who?: string | string[]): string {
  if (!who || (Array.isArray(who) && who.length === 0)) {
    return "Someone is typing";
  }
  const names = Array.isArray(who) ? who.filter(Boolean) : [who];
  if (names.length === 1) return `${names[0]} is typing`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
  return `${names[0]} and ${names.length - 1} others are typing`;
}

/**
 * Animated three-dot "is typing" indicator. Exposes an accessible polite
 * live-region label so screen readers announce who is composing.
 */
export function TypingIndicator({
  who,
  className,
}: TypingIndicatorProps): JSX.Element {
  const rootClass = ["rcui-typing", className].filter(Boolean).join(" ");
  const label = buildLabel(who);

  return (
    <div
      className={rootClass}
      role="status"
      aria-live="polite"
      aria-label={label}
      data-testid="typing-indicator"
      style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
    >
      <span className="rcui-typing__dot" aria-hidden="true" />
      <span className="rcui-typing__dot" aria-hidden="true" />
      <span className="rcui-typing__dot" aria-hidden="true" />
    </div>
  );
}
