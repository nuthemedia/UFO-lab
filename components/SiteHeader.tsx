import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label={`${siteConfig.shortName} home`}>
        <span className="brand-mark" aria-hidden="true" />
        <span>{siteConfig.shortName}</span>
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        <Link href="/">Brand</Link>
        <Link href="/ohtsuki">Ohtsuki</Link>
      </nav>
    </header>
  );
}
