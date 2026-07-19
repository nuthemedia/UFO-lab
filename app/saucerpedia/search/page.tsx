import type { Metadata } from "next";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "検索 | saucerpedia";
const description = "UFO / UAP の用語、人物、事件、資料、誤認、フェイク、体験モチーフを横断して探す検索ページ。";

export const metadata: Metadata = {
  ...createSaucerpediaMetadata({
    title,
    description,
    canonical: "/saucerpedia/search",
  }),
  robots: {
    index: false,
    follow: true,
  },
};

export default function SaucerpediaSearchPage() {
  return <SaucerpediaHome view="search" />;
}
