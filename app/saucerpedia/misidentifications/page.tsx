import type { Metadata } from "next";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFOと誤認 | saucerpedia";
const description = "UFOに見えやすい天体・航空機・生物・カメラ由来・錯覚を、見分けるポイントと一緒に整理。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/misidentifications",
});

export default function SaucerpediaMisidentificationsPage() {
  return <SaucerpediaHome view="misidentifications" />;
}
