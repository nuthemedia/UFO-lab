import { ImageResponse } from "next/og";
import { ogContentType, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;

const physicalPoints = "0,80 42,56 84,44 126,52 168,82 210,108 252,116 294,95 336,62 378,46 420,54";
const emotionalPoints = "0,48 42,58 84,82 126,108 168,118 210,103 252,72 294,50 336,40 378,51 420,76";
const intellectualPoints = "0,112 42,98 84,70 126,50 168,42 210,58 252,89 294,112 336,116 378,96 420,66";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d12",
          color: "#f7f0cf",
          padding: "54px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            gap: "48px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 440,
              height: 500,
              display: "flex",
              flexDirection: "column",
              padding: "18px",
              border: "5px solid #d8d1ba",
              borderRadius: "10px",
              background: "#eee4c9",
            }}
          >
            <div
              style={{
                height: 74,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "4px solid #17121a",
                background:
                  "linear-gradient(90deg, #ff2ca7 0 30%, #6324df 30% 52%, #f52530 52% 72%, #ffe04b 72% 100%)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  padding: "8px 14px",
                  border: "3px solid #ffe956",
                  background: "#110615",
                  color: "#ffe956",
                  fontSize: 30,
                  fontWeight: 900,
                  letterSpacing: 0,
                }}
              >
                バイオリズムマシン
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "22px",
                border: "12px solid #171817",
                background: "#020705",
                color: "#62ff87",
              }}
            >
              <div style={{ display: "flex", color: "#ffb04a", fontSize: 24, fontWeight: 900 }}>
                COMPUTER BIORHYTHM
              </div>
              <div style={{ display: "flex", marginTop: 8, fontSize: 24, fontWeight: 900 }}>
                INSERT 100 YEN
              </div>
              <svg width="100%" height="158" viewBox="0 0 420 140" style={{ marginTop: 18 }}>
                <rect x="0" y="0" width="420" height="140" fill="#030806" stroke="#4fff84" />
                <line x1="0" y1="70" x2="420" y2="70" stroke="#365a3d" />
                <polyline points={physicalPoints} fill="none" stroke="#49a7ff" strokeWidth="6" />
                <polyline points={emotionalPoints} fill="none" stroke="#ff5f4c" strokeWidth="6" />
                <polyline points={intellectualPoints} fill="none" stroke="#ffdd62" strokeWidth="6" />
              </svg>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 10,
                  fontSize: 17,
                  fontWeight: 900,
                }}
              >
                <span style={{ color: "#49a7ff" }}>P: BLUE</span>
                <span style={{ color: "#ff5f4c" }}>E: RED</span>
                <span style={{ color: "#ffdd62" }}>I: YELLOW</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 22,
                  color: "#ffb04a",
                  fontSize: 30,
                  fontWeight: 900,
                }}
              >
                PRESS START
              </div>
            </div>
          </div>

          <div
            style={{
              width: 560,
              display: "flex",
              flexDirection: "column",
              gap: "22px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                color: "#ffe956",
                fontSize: 74,
                lineHeight: 0.98,
                fontWeight: 900,
                letterSpacing: 0,
              }}
            >
              <span>バイオリズム</span>
              <span>マシン</span>
            </div>
            <div style={{ display: "flex", color: "#ff5fb8", fontSize: 34, fontWeight: 900 }}>
              COMPUTER BIORHYTHM
            </div>
            <div
              style={{
                display: "flex",
                color: "#d8e0d5",
                fontSize: 30,
                lineHeight: 1.35,
                fontWeight: 800,
              }}
            >
              1980年代のコンピューター占い機をスマホで操作する、娯楽用バイオリズム診断。
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 16,
                paddingTop: 24,
                borderTop: "3px solid #343945",
                color: "#93a09a",
                fontSize: 26,
                fontWeight: 900,
              }}
            >
              UFO Lab Tokyo Experiments
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
