import { ImageResponse } from "next/og";
import { OgBrand, OgFooter, OgFrame, ogContentType, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return new ImageResponse(
    (
      <OgFrame background="#f7f8f5" color="#171c19">
        <OgBrand color="#245447" />

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div style={{ display: "flex", color: "#b46a2a", fontSize: 28, fontWeight: 900 }}>AI NEWS CHECKER</div>
          <div style={{ display: "flex", fontSize: 92, lineHeight: 0.92, fontWeight: 900 }}>Keyhoe v0.5</div>
          <div style={{ display: "flex", fontSize: 42, lineHeight: 1.25, fontWeight: 800, color: "#35403a" }}>
            海外UFO・UAPニュース日本語チェッカー
          </div>
        </div>

        <OgFooter
          borderColor="#dfe5df"
          color="#66716b"
          left="公式資料・専門メディア・RedditをAIで要約"
          right="ufolab.tokyo/keyhoe"
        />
      </OgFrame>
    ),
    size,
  );
}
