import { ImageResponse } from "next/og";

export const alt = "Drake - 宇宙人はいるのか、地球に来ているのか";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const stars = Array.from({ length: 96 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  top: `${(index * 61) % 74}%`,
  size: 2 + (index % 5),
  opacity: 0.35 + (index % 7) * 0.08,
}));

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 50% 88%, rgba(92, 124, 188, 0.3), transparent 34%), radial-gradient(circle at 72% 18%, rgba(103, 157, 255, 0.16), transparent 32%), linear-gradient(180deg, #050713 0%, #080b1d 45%, #02030a 100%)",
          color: "#f6f8ff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {stars.map((star, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              borderRadius: 999,
              background: index % 13 === 0 ? "#ff9d88" : index % 7 === 0 ? "#ffd978" : index % 5 === 0 ? "#74b8ff" : "#e7efff",
              boxShadow: "0 0 16px currentColor",
              opacity: star.opacity,
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            left: -120,
            right: -120,
            bottom: -350,
            height: 520,
            borderRadius: "50% 50% 0 0",
            background:
              "radial-gradient(circle at 50% 0%, rgba(200, 226, 255, 0.56), rgba(88, 141, 220, 0.2) 18%, rgba(13, 32, 72, 0.92) 46%, #02030a 72%)",
            borderTop: "2px solid rgba(218, 235, 255, 0.74)",
            boxShadow: "0 -24px 80px rgba(99, 154, 255, 0.28)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "68px 78px 56px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "rgba(235, 242, 255, 0.74)" }}>
            <div style={{ display: "flex", fontSize: 25, letterSpacing: 2, fontWeight: 800 }}>THOUGHT EXPERIMENT</div>
            <div style={{ display: "flex", fontSize: 25, fontWeight: 800 }}>UFO Lab Tokyo</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 900 }}>
            <div style={{ display: "flex", fontSize: 124, lineHeight: 0.9, fontWeight: 900 }}>Drake</div>
            <div style={{ display: "flex", fontSize: 43, lineHeight: 1.22, fontWeight: 900 }}>
              宇宙人はいるのか、地球に来ているのか
            </div>
            <div style={{ display: "flex", maxWidth: 820, color: "rgba(230, 238, 255, 0.78)", fontSize: 28, lineHeight: 1.45, fontWeight: 700 }}>
              ドレイクの方程式とベイズ推論で、存在・来訪・UFO証拠を分けて考える。
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(230, 238, 255, 0.22)",
              paddingTop: 24,
              color: "rgba(230, 238, 255, 0.72)",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            <span>N = R* · fp · ne · fl · fi · fc · L</span>
            <span>ufolab.tokyo/drake</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
