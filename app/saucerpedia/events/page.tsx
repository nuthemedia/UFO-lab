import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFO事件辞典 | saucerpedia";
const description = "古典UFOから現代UAP、日本UFO史まで、代表事件を時代・場所・関連項目でたどる事件辞典。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/events",
});

type PageProps = {
  searchParams?: Promise<{ item?: string }>;
};

export default async function SaucerpediaEventsPage({ searchParams }: PageProps) {
  const item = (await searchParams)?.item;
  if (item) {
    redirect(`/saucerpedia/events/${encodeURIComponent(item)}`);
  }

  return <SaucerpediaHome view="events" />;
}
