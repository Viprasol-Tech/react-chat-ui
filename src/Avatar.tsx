import { useState } from "react";
import { getInitials } from "./helpers";

/** Props for {@link Avatar}. */
export interface AvatarProps {
  /** Display name; used for initials fallback and the accessible label. */
  name?: string;
  /** Image URL. Falls back to initials if absent or it fails to load. */
  src?: string;
  /** Pixel diameter of the (circular) avatar. Default `32`. */
  size?: number;
  /** Extra class names appended to the root element. */
  className?: string;
}

/**
 * Circular avatar that renders an image when `src` is provided and loads
 * successfully, otherwise a colored initials chip derived from `name`.
 */
export function Avatar({
  name,
  src,
  size = 32,
  className,
}: AvatarProps): JSX.Element {
  const [failed, setFailed] = useState(false);
  const rootClass = ["rcui-avatar", className].filter(Boolean).join(" ");
  const label = name ? `${name}'s avatar` : "avatar";

  const base = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    objectFit: "cover" as const,
  };

  if (src && !failed) {
    return (
      <img
        className={rootClass}
        src={src}
        alt={label}
        width={size}
        height={size}
        style={base}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${rootClass} rcui-avatar--initials`}
      role="img"
      aria-label={label}
      style={{
        ...base,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.4),
        fontWeight: 600,
        background: "#dbeafe",
        color: "#1e3a8a",
        userSelect: "none",
      }}
    >
      {getInitials(name)}
    </span>
  );
}
