import { ImageResponse } from "next/og";

export const alt = "Jenny｜UFO報告文書をJevで分析";

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
          background: "#f6f7f3",
          color: "#1f2420",
          padding: "62px 72px 0",
          fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #d9e1db",
            paddingBottom: "24px",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: "#405f51",
          }}
        >
          <span>UFO LAB TOKYO</span>
          <span style={{ color: "#667069", letterSpacing: "0.08em" }}>
            UFO REPORT ANALYZER
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            padding: "32px 0 38px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "26px",
            }}
          >
            <span
              style={{
                fontSize: 132,
                lineHeight: 0.92,
                fontWeight: 900,
                letterSpacing: "-0.06em",
              }}
            >
              Jenny
            </span>
            <span
              style={{
                color: "#8fd6e4",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "0.12em",
              }}
            >
              JEV ANALYSIS
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 50,
              lineHeight: 1.22,
              fontWeight: 800,
              letterSpacing: "-0.035em",
            }}
          >
            UFO報告文書をJevで分析
          </div>
        </div>

        <div
          style={{
            height: 126,
            margin: "0 -72px",
            padding: "0 72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#101814",
            color: "#f2f7f3",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              fontSize: 27,
              fontWeight: 800,
            }}
          >
            <span
              style={{
                width: 52,
                height: 6,
                display: "flex",
                background: "#93bda7",
              }}
            />
            20の型付き判定 / 5つの指標
          </div>
          <span
            style={{
              color: "#8fd6e4",
              fontSize: 23,
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            ufolab.tokyo/jenny
          </span>
        </div>
      </div>
    ),
    size,
  );
}
