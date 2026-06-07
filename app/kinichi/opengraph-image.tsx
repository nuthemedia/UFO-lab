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
          background: "#050505",
          color: "#f4f4f0",
          padding: "68px",
          fontFamily: "Arial, Helvetica, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 76% 42%, rgba(183,255,206,0.18), transparent 28%), linear-gradient(90deg, rgba(232,232,220,0.04) 1px, transparent 1px), linear-gradient(0deg, rgba(232,232,220,0.035) 1px, transparent 1px)",
            backgroundSize: "100% 100%, 64px 64px, 64px 64px",
          }}
        />
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#b7ffce", fontSize: 28, fontWeight: 900 }}>
            <div
              style={{
                width: 96,
                height: 42,
                border: "3px solid #b7ffce",
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
          <div style={{ color: "#a8a8a0", fontSize: 24, fontWeight: 900 }}>UFO SHAPE ATLAS</div>
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 52 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", color: "#b7ffce", fontSize: 28, fontWeight: 900 }}>UFO形体事典</div>
            <div style={{ display: "flex", fontSize: 118, lineHeight: 0.88, fontWeight: 900, letterSpacing: -3 }}>KINICHI</div>
            <div style={{ display: "flex", maxWidth: 720, color: "#e8e8dc", fontSize: 34, lineHeight: 1.35, fontWeight: 850 }}>
              円盤、球体、葉巻型、三角形、Tic Tac。
              <br />
              報告に現れる形体を3Dと線画で確認。
            </div>
          </div>

          <div
            style={{
              width: 330,
              height: 240,
              border: "2px solid rgba(232,232,220,0.5)",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(17,17,17,0.72)",
              boxShadow: "0 0 70px rgba(183,255,206,0.12)",
            }}
          >
            <svg width="260" height="150" viewBox="0 0 260 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="130" cy="78" rx="92" ry="24" stroke="#f4f4f0" strokeWidth="5" />
              <path d="M70 76C86 42 174 42 190 76" stroke="#f4f4f0" strokeWidth="5" strokeLinecap="round" />
              <path d="M50 79H210" stroke="#b7ffce" strokeWidth="4" strokeLinecap="round" />
              <circle cx="96" cy="83" r="5" fill="#b7ffce" />
              <circle cx="130" cy="86" r="5" fill="#b7ffce" />
              <circle cx="164" cy="83" r="5" fill="#b7ffce" />
            </svg>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(232,232,220,0.24)",
            paddingTop: 26,
            color: "#a8a8a0",
            fontSize: 25,
            fontWeight: 800,
          }}
        >
          <span>3Dモデル・線画シルエット・代表事件・目撃データ分類</span>
          <span>ufolab.tokyo/kinichi</span>
        </div>
      </div>
    ),
    size,
  );
}
