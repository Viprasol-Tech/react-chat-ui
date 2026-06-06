import type { ChatAttachment } from "./types";
import { formatBytes } from "./helpers";

/** Props for {@link Attachment}. */
export interface AttachmentProps {
  /** The attachment to render. */
  attachment: ChatAttachment;
  /** Extra class names appended to the root element. */
  className?: string;
}

/**
 * Render a single message attachment. Images show a thumbnail link; other
 * files show a download row with name and (optional) size.
 */
export function Attachment({
  attachment,
  className,
}: AttachmentProps): JSX.Element {
  const rootClass = [
    "rcui-attachment",
    `rcui-attachment--${attachment.kind}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const sizeLabel = attachment.size != null ? formatBytes(attachment.size) : "";

  if (attachment.kind === "image") {
    return (
      <a
        className={rootClass}
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`attachment-${attachment.id}`}
        title={attachment.name}
      >
        <img
          className="rcui-attachment__image"
          src={attachment.url}
          alt={attachment.name}
          style={{ maxWidth: "100%", borderRadius: 8, display: "block" }}
        />
      </a>
    );
  }

  return (
    <a
      className={rootClass}
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.name}
      data-testid={`attachment-${attachment.id}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
      }}
    >
      <span className="rcui-attachment__icon" aria-hidden="true">
        📎
      </span>
      <span className="rcui-attachment__name">{attachment.name}</span>
      {sizeLabel && (
        <span className="rcui-attachment__size">{sizeLabel}</span>
      )}
    </a>
  );
}
