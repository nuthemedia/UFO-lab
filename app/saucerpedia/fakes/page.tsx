import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFOとフェイク | saucerpedia";
const description = "模型、撮影トリック、CG、AI生成、初出確認など、UFO写真・動画を見るときの確認観点を整理。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/fakes",
});

type PageProps = {
  searchParams?: Promise<{ item?: string }>;
};

export default async function SaucerpediaFakesPage({ searchParams }: PageProps) {
  const item = (await searchParams)?.item;
  if (item) {
    redirect(`/saucerpedia/fakes/${encodeURIComponent(item)}`);
  }

  return <SaucerpediaHome view="fakes" />;
}
