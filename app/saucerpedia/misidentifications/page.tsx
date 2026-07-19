import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFOと誤認 | saucerpedia";
const description = "UFOに見えやすい天体・航空機・生物・カメラ由来・錯覚を、見分けるポイントと一緒に整理。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/misidentifications",
});

type PageProps = {
  searchParams?: Promise<{ item?: string }>;
};

export default async function SaucerpediaMisidentificationsPage({ searchParams }: PageProps) {
  const item = (await searchParams)?.item;
  if (item) {
    redirect(`/saucerpedia/misidentifications/${encodeURIComponent(item)}`);
  }

  return <SaucerpediaHome view="misidentifications" />;
}
