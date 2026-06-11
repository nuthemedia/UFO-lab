import { ImageResponse } from "next/og";
import { OgBrand, OgFooter, OgFrame, ogContentType, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return new ImageResponse(
    (
      <OgFrame background="#eef1ec" color="#171c19">
        <OgBrand color="#245447" label="KEAN PORTAL" labelColor="#b46a2a" />

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 104, lineHeight: 0.92, fontWeight: 900 }}>Kean</div>
          <div style={{ display: "flex", fontSize: 44, lineHeight: 1.2, fontWeight: 900 }}>
            UFO・UAPディスクロージャー入門
          </div>
          <div style={{ display: "flex", maxWidth: 900, color: "#35403a", fontSize: 30, lineHeight: 1.45, fontWeight: 800 }}>
            基本、歴史、人物、代表的なUAP動画を日本語で整理する入門ポータル。
          </div>
        </div>

        <OgFooter
          borderColor="#c5cec3"
          color="#35403a"
          left="確認済み事実・主張・未検証点を分けて読む"
          right="ufolab.tokyo/kean"
        />
      </OgFrame>
    ),
    size,
  );
}
