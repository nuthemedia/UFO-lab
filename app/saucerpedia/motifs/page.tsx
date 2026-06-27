import type { Metadata } from "next";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFO体験モチーフ辞典 | saucerpedia";
const description = "目撃、接近、コンタクト、アブダクション、ハイストレンジネスに繰り返し出てくる体験要素を整理。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/motifs",
});

export default function SaucerpediaMotifsPage() {
  return <SaucerpediaHome view="motifs" />;
}
