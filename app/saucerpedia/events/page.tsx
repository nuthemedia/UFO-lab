import type { Metadata } from "next";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFO事件辞典 | saucerpedia";
const description = "古典UFOから現代UAP、日本UFO史まで、代表事件を時代・場所・関連項目でたどる事件辞典。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/events",
});

export default function SaucerpediaEventsPage() {
  return <SaucerpediaHome view="events" />;
}
