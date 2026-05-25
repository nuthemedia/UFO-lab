import Link from "next/link";

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={`site-footer${className ? ` ${className}` : ""}`}>
      <div className="site-footer-inner">
        <div className="site-footer-copy">
          <Link href="/">東京UFO研究室</Link>
          <p>
            UFO Research Lab Tokyo <span>All rights reserved</span>
          </p>
          <p>&copy; 2026 東京UFO研究室</p>
        </div>

        <a
          className="site-footer-social"
          href="https://x.com/UFOLabTokyo"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="X / UFO Lab Tokyo"
          title="X / UFO Lab Tokyo"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
