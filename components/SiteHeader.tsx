import Link from "next/link";
import { brandHomeContent, type BrandLocale } from "@/lib/brandHomeContent";
import { siteConfig } from "@/lib/site";

type SiteHeaderProps = {
  locale?: BrandLocale;
};

export function SiteHeader({ locale = "ja" }: SiteHeaderProps) {
  const content = brandHomeContent[locale];

  return (
    <header className="site-header">
      <Link className="brand" href={content.path} aria-label={`${siteConfig.shortName} home`}>
        <span className="brand-mark" aria-hidden="true" />
        <span>{siteConfig.shortName}</span>
      </Link>
      <nav className="brand-language-switch" aria-label="Language">
        <span aria-current="page">{content.currentLabel}</span>
        <Link href={content.alternatePath}>{content.alternateLabel}</Link>
      </nav>
    </header>
  );
}
