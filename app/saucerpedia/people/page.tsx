import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFO人物辞典 | saucerpedia";
const description = "UFO / UAP 史に関わる人物を、立場、時代、関連用語から整理する人物辞典。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/people",
});

type PageProps = {
  searchParams?: Promise<{ item?: string }>;
};

export default async function SaucerpediaPeoplePage({ searchParams }: PageProps) {
  const item = (await searchParams)?.item;
  if (item) {
    redirect(`/saucerpedia/people/${encodeURIComponent(item)}`);
  }

  return <SaucerpediaHome view="people" />;
}
