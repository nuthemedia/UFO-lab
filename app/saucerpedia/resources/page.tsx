import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFO資料・機関辞典 | saucerpedia";
const description = "政府調査、公開制度、民間団体、報告受付組織を、役割と関連人物・用語からたどる資料・機関辞典。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/resources",
});

type PageProps = {
  searchParams?: Promise<{ item?: string }>;
};

export default async function SaucerpediaResourcesPage({ searchParams }: PageProps) {
  const item = (await searchParams)?.item;
  if (item) {
    redirect(`/saucerpedia/resources/${encodeURIComponent(item)}`);
  }

  return <SaucerpediaHome view="resources" />;
}
