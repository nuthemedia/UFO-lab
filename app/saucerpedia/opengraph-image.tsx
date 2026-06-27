import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const bookColors = [
  { cover: "#4c9a9b", spine: "#2f686b", label: "GLOSSARY" },
  { cover: "#5964a3", spine: "#333d73", label: "PEOPLE" },
  { cover: "#c99635", spine: "#8d661f", label: "CASES" },
  { cover: "#4d75bb", spine: "#2e4e86", label: "HISTORY" },
  { cover: "#5d9360", spine: "#37643a", label: "IFO" },
  { cover: "#b36573", spine: "#7a3b48", label: "FAKES" },
  { cover: "#4e94b0", spine: "#2f6379", label: "ARCHIVES" },
  { cover: "#81609c", spine: "#533867", label: "MOTIFS" },
];

function BookStackMark() {
  return (
    <div style={{ position: "relative", width: 430, height: 370, display: "flex" }}>
      {bookColors.map((book, index) => (
        <div
          key={book.label}
          style={{
            position: "absolute",
            left: index * 16,
            top: index * 23,
            width: 350,
            height: 238,
            borderRadius: 10,
            background: book.cover,
            border: `4px solid ${book.spine}`,
            boxShadow: "0 18px 35px rgba(22, 40, 38, 0.16)",
            display: "flex",
            overflow: "hidden",
          }}
        >
          <div style={{ width: 52, height: "100%", background: book.spine }} />
          <div
            style={{
              flex: 1,
              height: "100%",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.42), rgba(255,255,255,0.22)), linear-gradient(0deg, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
              backgroundSize: "100% 100%, 24px 24px, 24px 24px",
              padding: "28px 28px",
              color: book.spine,
              fontSize: 23,
              fontWeight: 900,
              letterSpacing: "0.04em",
            }}
          >
            {book.label}
          </div>
          <div style={{ width: 28, height: "100%", background: "#eee6d6" }} />
        </div>
      ))}
    </div>
  );
}

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
          background: "linear-gradient(135deg, #f6fbf8 0%, #e1f2f0 54%, #f4ecd8 100%)",
          color: "#102420",
          padding: "62px 68px",
          fontFamily: "Arial, Helvetica, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 80% 25%, rgba(77,117,187,0.16), transparent 26%), radial-gradient(circle at 12% 80%, rgba(201,150,53,0.18), transparent 28%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#174a4a", fontSize: 28, fontWeight: 900 }}>
            <div
              style={{
                width: 88,
                height: 38,
                border: "3px solid #174a4a",
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                fontWeight: 900,
              }}
            >
              UFO
            </div>
            UFO Lab Tokyo
          </div>
          <div style={{ color: "#38534e", fontSize: 24, fontWeight: 900 }}>UFO ENCYCLOPEDIA</div>
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 650 }}>
            <div style={{ color: "#1f6a69", fontSize: 30, fontWeight: 900 }}>Saucerpedia</div>
            <div style={{ fontSize: 92, lineHeight: 0.94, fontWeight: 950, letterSpacing: -1 }}>
              空飛ぶ円盤辞典
            </div>
            <div
              style={{
                color: "#30433f",
                display: "flex",
                flexDirection: "column",
                fontSize: 34,
                lineHeight: 1.35,
                fontWeight: 820,
              }}
            >
              <span>UFO / UAP の用語・人物・事件・資料を</span>
              <span>ジャンル別に調べるカード辞典。</span>
            </div>
          </div>
          <BookStackMark />
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid rgba(23,74,74,0.22)",
            paddingTop: 24,
            color: "#4a625d",
            fontSize: 25,
            fontWeight: 850,
          }}
        >
          <span>Glossary / People / Cases / History / IFO / Fakes / Archives / Motifs</span>
          <span>ufolab.tokyo/saucerpedia</span>
        </div>
      </div>
    ),
    size,
  );
}
