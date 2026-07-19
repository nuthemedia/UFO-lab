import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFO体験モチーフ辞典 | saucerpedia";
const description = "目撃、接近、コンタクト、アブダクション、ハイストレンジネスに繰り返し出てくる体験要素を整理。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/motifs",
});

type PageProps = {
  searchParams?: Promise<{ item?: string }>;
};

export default async function SaucerpediaMotifsPage({ searchParams }: PageProps) {
  const item = (await searchParams)?.item;
  if (item) {
    redirect(`/saucerpedia/motifs/${encodeURIComponent(item)}`);
  }

  return <SaucerpediaHome view="motifs" />;
}
