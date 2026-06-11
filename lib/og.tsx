import type { ReactNode } from "react";

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = "image/png";

/**
 * Outer frame shared by route-level OG images: full-bleed column with
 * space-between vertical rhythm. Pass `relative` when the page layers an
 * absolutely-positioned overlay (e.g. kinichi's grid background).
 */
export function OgFrame({
  background,
  color,
  relative = false,
  children,
}: {
  background: string;
  color: string;
  relative?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background,
        color,
        padding: "68px",
        fontFamily: "Arial, Helvetica, sans-serif",
        ...(relative ? { position: "relative" as const } : {}),
      }}
    >
      {children}
    </div>
  );
}

/** "UFO" pill + site name, optionally with a right-aligned section label. */
export function OgBrand({
  color,
  label,
  labelColor,
  relative = false,
}: {
  color: string;
  label?: string;
  labelColor?: string;
  relative?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...(relative ? { position: "relative" as const } : {}),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18, color, fontSize: 30, fontWeight: 900 }}>
        <div
          style={{
            width: 96,
            height: 42,
            border: `3px solid ${color}`,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 900,
          }}
        >
          UFO
        </div>
        UFO Lab Tokyo
      </div>
      {label ? <div style={{ color: labelColor, fontSize: 26, fontWeight: 900 }}>{label}</div> : null}
    </div>
  );
}

/** Bottom bar with a top border, tagline on the left and URL on the right. */
export function OgFooter({
  borderColor,
  color,
  left,
  right,
  relative = false,
}: {
  borderColor: string;
  color: string;
  left: string;
  right: string;
  relative?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: `2px solid ${borderColor}`,
        paddingTop: 26,
        color,
        fontSize: 26,
        fontWeight: 800,
        ...(relative ? { position: "relative" as const } : {}),
      }}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}
