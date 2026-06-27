import type { Metadata } from "next";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFOの歴史カード | saucerpedia";
const description = "現代UFO以前の空の怪異から現代UAPまで、時代ごとの見取り図をカードでたどる歴史入口。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/history",
});

export default function SaucerpediaHistoryPage() {
  return <SaucerpediaHome view="history" />;
}
