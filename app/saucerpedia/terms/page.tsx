import type { Metadata } from "next";
import { SaucerpediaHome } from "../SaucerpediaHome";
import { createSaucerpediaMetadata } from "../seo";

const title = "UFO用語辞典 | saucerpedia";
const description = "UFO / UAP の基本語から現代UAPまで、意味と関連項目をカードで調べる用語辞典。";

export const metadata: Metadata = createSaucerpediaMetadata({
  title,
  description,
  canonical: "/saucerpedia/terms",
});

export default function SaucerpediaTermsPage() {
  return <SaucerpediaHome view="terms" />;
}
