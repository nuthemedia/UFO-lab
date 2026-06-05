import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { keanBeginnerTierLabels, keanPersonCategoryLabels } from "@/data/kean/labels";
import { people, peopleById } from "@/data/kean/people";
import { getKeanPersonIllustration } from "@/lib/keanPortrait";

export const runtime = "nodejs";
export const dynamicParams = false;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type KeanPersonOgProps = {
  params: Promise<{ id: string }> | { id: string };
};

export function generateStaticParams() {
  return people.map((person) => ({ id: person.id }));
}

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "ufolab.tokyo";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol || (host.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

export default async function Image({ params }: KeanPersonOgProps) {
  const { id } = await Promise.resolve(params);
  const person = peopleById.get(id);

  if (!person) {
    notFound();
  }

  const image = getKeanPersonIllustration(person);
  const imageSrc = image ? `${await getRequestOrigin()}${image.sourceUrl}` : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          gap: 54,
          alignItems: "center",
          background: "#eef1ec",
          color: "#171c19",
          padding: "68px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            width: 390,
            height: 490,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: "3px solid #c5cec3",
            borderRadius: 22,
            background: "#ffffff",
          }}
        >
          {imageSrc && image ? (
            <img
              src={imageSrc}
              alt={image.alt}
              width={390}
              height={490}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ fontSize: 88, fontWeight: 900, color: "#245447" }}>{person.jaName.slice(0, 2)}</div>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", color: "#245447", fontSize: 28, fontWeight: 900 }}>Kean 人物図鑑</div>
          <div style={{ display: "flex", fontSize: 76, lineHeight: 1.02, fontWeight: 900 }}>{person.jaName}</div>
          <div style={{ display: "flex", color: "#35403a", fontSize: 34, fontWeight: 800 }}>{person.name}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span
              style={{
                display: "flex",
                padding: "9px 14px",
                borderRadius: 999,
                background: "#245447",
                color: "#ffffff",
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              {keanPersonCategoryLabels[person.category]}
            </span>
            <span
              style={{
                display: "flex",
                padding: "9px 14px",
                border: "2px solid #c5cec3",
                borderRadius: 999,
                color: "#35403a",
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              {keanBeginnerTierLabels[person.beginnerTier]}
            </span>
          </div>
          <div style={{ display: "flex", color: "#35403a", fontSize: 28, lineHeight: 1.5, fontWeight: 800 }}>
            {person.oneLine}
          </div>
          <div style={{ display: "flex", marginTop: 12, color: "#b46a2a", fontSize: 24, fontWeight: 900 }}>
            確認済み事実・主張・注意点を分けて読む
          </div>
        </div>
      </div>
    ),
    size,
  );
}
