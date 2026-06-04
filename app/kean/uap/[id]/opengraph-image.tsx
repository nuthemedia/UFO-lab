import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { keanUapById, keanUapRecords } from "@/data/kean/uap";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const dynamicParams = false;

type KeanUapOgProps = {
  params: Promise<{ id: string }> | { id: string };
};

export function generateStaticParams() {
  return keanUapRecords.map((record) => ({ id: record.id }));
}

export default async function Image({ params }: KeanUapOgProps) {
  const { id } = await Promise.resolve(params);
  const record = keanUapById.get(id);

  if (!record) {
    notFound();
  }

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
          padding: "68px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", color: "#245447", fontSize: 30, fontWeight: 900 }}>Kean 知っておきたいUAP</div>
          <div style={{ display: "flex", color: "#b46a2a", fontSize: 30, fontWeight: 900 }}>{record.yearLabel}</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 50,
          }}
        >
          <div
            style={{
              width: 330,
              height: 250,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid #245447",
              borderRadius: 28,
              background: "linear-gradient(180deg, #9ad0df 0%, #d8f0f6 42%, #247b8a 54%, #0f6071 100%)",
              color: "#ffffff",
              fontSize: 42,
              fontWeight: 900,
            }}
          >
            UAP
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 88, lineHeight: 0.98, fontWeight: 900 }}>{record.jaName}</div>
            <div style={{ display: "flex", color: "#35403a", fontSize: 34, fontWeight: 800 }}>{record.name}</div>
            <div style={{ display: "flex", color: "#35403a", fontSize: 28, lineHeight: 1.45, fontWeight: 800 }}>
              {record.shortSummary}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #c5cec3",
            paddingTop: 24,
            color: "#35403a",
            fontSize: 26,
            fontWeight: 900,
          }}
        >
          <span>確認済み事実・議論点・注意点を分けて読む</span>
          <span>ufolab.tokyo/kean/uap/{record.id}</span>
        </div>
      </div>
    ),
    size,
  );
}
