import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const stars = Array.from({ length: 72 }, (_, index) => ({
  left: `${(index * 43) % 100}%`,
  top: `${(index * 29) % 86}%`,
  size: 2 + (index % 4),
  opacity: 0.14 + (index % 6) * 0.07,
}));

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 22% 30%, rgba(214,230,255,0.16), transparent 27%), radial-gradient(circle at 78% 20%, rgba(95,128,190,0.2), transparent 30%), linear-gradient(135deg, #04070d 0%, #0a101b 48%, #020308 100%)",
          color: "#f7f9ff",
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
              background: "#e8f0ff",
              boxShadow: "0 0 18px rgba(232,240,255,0.8)",
              opacity: star.opacity,
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            right: 72,
            top: 96,
            width: 430,
            height: 340,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(234,242,255,0.14)",
            borderRadius: 30,
            background: "rgba(5,8,14,0.5)",
            boxShadow: "0 30px 120px rgba(0,0,0,0.45)",
          }}
        >
          <svg width="330" height="230" viewBox="0 0 330 230" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M64 130C106 73 194 47 270 74C225 95 195 123 173 166C136 155 102 145 64 130Z"
              fill="url(#craftGlow)"
              stroke="#F4F7FF"
              strokeWidth="7"
              strokeLinejoin="round"
            />
            <path d="M72 130C123 140 166 128 214 91" stroke="#AFC8F0" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
            <path d="M178 70C190 92 190 120 176 160" stroke="#DDE9FF" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
            <path d="M40 176C116 147 202 150 290 184" stroke="#6D88B5" strokeWidth="3" strokeLinecap="round" opacity="0.46" />
            <defs>
              <linearGradient id="craftGlow" x1="81" x2="255" y1="73" y2="165" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F9FBFF" />
                <stop offset="0.5" stopColor="#AFC4E7" />
                <stop offset="1" stopColor="#313D51" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div
          style={{
            position: "absolute",
            inset: "64px 68px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(226,236,255,0.72)", fontSize: 25, fontWeight: 900 }}>
            <span>NIGHT DIGITAL MUSEUM</span>
            <span>UFO Lab Tokyo</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 660 }}>
            <div style={{ display: "flex", color: "rgba(205,222,248,0.76)", fontSize: 30, fontWeight: 900 }}>Clark - UFO事件と人物</div>
            <div style={{ display: "flex", fontSize: 84, lineHeight: 1.02, fontWeight: 900, letterSpacing: -2 }}>UFO事件を、展示として読む。</div>
            <div style={{ display: "flex", maxWidth: 620, color: "rgba(232,239,252,0.84)", fontSize: 32, lineHeight: 1.35, fontWeight: 800 }}>
              テキスト・映像・3D展示でたどるデジタル・ミュージアム。
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(232,240,255,0.22)",
              paddingTop: 24,
              color: "rgba(226,236,255,0.7)",
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            <span>Kenneth Arnold / June 24, 1947</span>
            <span>ufolab.tokyo/clark</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
