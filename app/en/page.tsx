import type { Metadata } from "next";
import { BrandHomePage } from "@/components/BrandHomePage";
import { createHomeMetadata } from "@/lib/seo";

export const metadata: Metadata = createHomeMetadata("en");

export default function EnglishHomePage() {
  return <BrandHomePage locale="en" />;
}
