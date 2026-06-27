import type { Metadata } from "next";
import { SaucerpediaHome } from "./SaucerpediaHome";
import { createSaucerpediaMetadata } from "./seo";

const title = "空飛ぶ円盤辞典 | saucerpedia";
const description =
  "UFO / UAP の基本用語・人物・事件・資料・機関・体験モチーフ・誤認例・フェイク確認を、古典UFOから現代UAPまでカードで調べる入口サイト。";

export const metadata: Metadata = {
  ...createSaucerpediaMetadata({
    title,
    description,
    canonical: "/saucerpedia",
  }),
  robots: {
    index: true,
    follow: true,
  },
};

export default function SaucerpediaPage() {
  return <SaucerpediaHome />;
}
