import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFO用語辞典 | saucerpedia";
const description = "UFO / UAP の基本語から現代UAPまで、意味と関連項目をカードで調べる用語辞典。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/terms",
});

type PageProps = {
  searchParams?: Promise<{ item?: string }>;
};

export default async function SaucerpediaTermsPage({ searchParams }: PageProps) {
  const item = (await searchParams)?.item;
  if (item) {
    redirect(`/saucerpedia/terms/${encodeURIComponent(item)}`);
  }

  return <SaucerpediaHome view="terms" />;
}
