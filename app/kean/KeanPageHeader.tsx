import Link from "next/link";
import { siteConfig } from "@/lib/site";

type KeanPageHeaderProps = {
  activeHref?: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  description?: string;
  variant?: "portal" | "page";
};

const navItems = [
  { href: "/kean", label: "トップ" },
  { href: "/kean/about", label: "ディスクロージャーとは" },
  { href: "/kean/history", label: "歴史" },
  { href: "/kean/uap", label: "知っておきたいUAP" },
  { href: "/kean/people", label: "人物図鑑" },
];

export function KeanPageHeader({
  activeHref,
  eyebrow = "Kean",
  title,
  subtitle,
  description,
  variant = "page",
}: KeanPageHeaderProps) {
  return (
    <header className={`kean-site-header kean-site-header--${variant}`}>
      <div className="ohtsuki-brand-mark" aria-label={siteConfig.shortName}>
        <div className="orbital-mark orbital-mark-compact" aria-hidden="true">
          <span className="orbit-ring orbit-ring-one" />
          <span className="orbit-ring orbit-ring-two" />
          <span className="orbit-ring orbit-ring-three" />
          <span className="orbit-dot orbit-dot-one" />
          <span className="orbit-dot orbit-dot-two" />
          <span className="orbit-dot orbit-dot-three" />
          <span className="ohtsuki-brand-text">{siteConfig.shortName}</span>
        </div>
        <span className="sr-only">{siteConfig.shortName}</span>
      </div>
      <div className="kean-site-header-copy">
        {variant === "page" ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p className="tagline">{subtitle}</p>
        {description ? <p className="lead">{description}</p> : null}
      </div>
      <nav className="kean-subnav" aria-label="Kean navigation">
        {navItems.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            aria-current={activeHref === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
