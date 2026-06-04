import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#eef1ec",
          color: "#171c19",
          padding: "72px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#245447", fontSize: 30, fontWeight: 900 }}>
            <div
              style={{
                width: 96,
                height: 42,
                border: "3px solid #245447",
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
          <div style={{ color: "#b46a2a", fontSize: 26, fontWeight: 900 }}>KEAN PORTAL</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 104, lineHeight: 0.92, fontWeight: 900 }}>Kean</div>
          <div style={{ display: "flex", fontSize: 44, lineHeight: 1.2, fontWeight: 900 }}>
            UFO・UAPディスクロージャー入門
          </div>
          <div style={{ display: "flex", maxWidth: 900, color: "#35403a", fontSize: 30, lineHeight: 1.45, fontWeight: 800 }}>
            基本、歴史、人物、代表的なUAP動画を日本語で整理する入門ポータル。
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "2px solid #c5cec3",
            paddingTop: 26,
            color: "#35403a",
            fontSize: 26,
            fontWeight: 800,
          }}
        >
          <span>確認済み事実・主張・未検証点を分けて読む</span>
          <span>ufolab.tokyo/kean</span>
        </div>
      </div>
    ),
    size,
  );
}
