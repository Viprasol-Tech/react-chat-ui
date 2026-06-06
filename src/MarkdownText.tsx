import { Fragment } from "react";
import { parseInlineMarkdown } from "./helpers";

/** Props for {@link MarkdownText}. */
export interface MarkdownTextProps {
  /** Raw message text containing safe inline markdown. */
  text: string;
  /** Extra class names appended to the wrapping element. */
  className?: string;
}

/**
 * Render a string with safe inline markdown (`**bold**`, `*italic*`,
 * `` `code` ``, `[link](href)`). No raw HTML is ever interpreted, so the
 * output is XSS-safe. Newlines are preserved as `<br />`.
 */
export function MarkdownText({ text, className }: MarkdownTextProps): JSX.Element {
  const rootClass = ["rcui-md", className].filter(Boolean).join(" ");

  return (
    <span className={rootClass}>
      {text.split("\n").map((line, lineIndex, lines) => (
        <Fragment key={lineIndex}>
          {parseInlineMarkdown(line).map((token, i) => {
            switch (token.type) {
              case "bold":
                return <strong key={i}>{token.value}</strong>;
              case "italic":
                return <em key={i}>{token.value}</em>;
              case "code":
                return (
                  <code key={i} className="rcui-md__code">
                    {token.value}
                  </code>
                );
              case "link":
                return (
                  <a
                    key={i}
                    className="rcui-md__link"
                    href={token.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {token.value}
                  </a>
                );
              case "text":
              default:
                return <Fragment key={i}>{token.value}</Fragment>;
            }
          })}
          {lineIndex < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </span>
  );
}
