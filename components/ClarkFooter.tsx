import Link from "next/link";
import styles from "./clark.module.css";

export function ClarkFooter() {
  return (
    <footer className={styles.caseFooter}>
      <Link href="/" className={styles.caseFooterBrand}>
        UFO Lab Tokyo
      </Link>
      <div className={styles.caseFooterLinks}>
        <a href="https://x.com/UFOLabTokyo" target="_blank" rel="noreferrer noopener" className={styles.caseFooterX}>
          X
        </a>
      </div>
      <p>© 2026 UFO Lab Tokyo</p>
    </footer>
  );
}
