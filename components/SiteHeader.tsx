import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="UFOlab home">
        <span className="brand-mark" aria-hidden="true" />
        <span>UFOlab</span>
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        <Link href="/">Top</Link>
        <Link href="/ufo-image-checker">Image checker</Link>
      </nav>
    </header>
  );
}
