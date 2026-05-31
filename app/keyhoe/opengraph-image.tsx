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
          background: "#f7f8f5",
          color: "#171c19",
          padding: "72px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            color: "#245447",
            fontSize: 30,
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: 96,
              height: 42,
              border: "3px solid #245447",
              borderRadius: "999px",
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

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div
            style={{
              display: "flex",
              color: "#b46a2a",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: 0,
            }}
          >
            AI NEWS CHECKER
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              lineHeight: 0.92,
              fontWeight: 900,
              letterSpacing: 0,
            }}
          >
            Keyhoe v0.5
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 42,
              lineHeight: 1.25,
              fontWeight: 800,
              color: "#35403a",
            }}
          >
            海外UFO・UAPニュース日本語チェッカー
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #dfe5df",
            paddingTop: "28px",
            color: "#66716b",
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          <span>公式資料・専門メディア・RedditをAIで要約</span>
          <span>ufolab.tokyo/keyhoe</span>
        </div>
      </div>
    ),
    size,
  );
}
