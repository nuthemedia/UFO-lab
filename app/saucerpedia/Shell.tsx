"use client";

import Link from "next/link";
import styles from "./saucerpedia.module.css";

export type SaucerpediaView =
  | "home"
  | "terms"
  | "people"
  | "events"
  | "history"
  | "misidentifications"
  | "fakes"
  | "resources"
  | "motifs"
  | "search";

const bottomNavItems = [
  { href: "/saucerpedia/terms", label: "用語", view: "terms" },
  { href: "/saucerpedia/people", label: "人物", view: "people" },
  { href: "/saucerpedia/events", label: "事件", view: "events" },
];

const drawerLinks = [
  { href: "/saucerpedia/terms", label: "用語" },
  { href: "/saucerpedia/people", label: "人物" },
  { href: "/saucerpedia/events", label: "事件" },
  { href: "/saucerpedia/resources", label: "資料・機関" },
  { href: "/saucerpedia/misidentifications", label: "誤認" },
  { href: "/saucerpedia/fakes", label: "フェイク" },
  { href: "/saucerpedia/motifs", label: "体験モチーフ" },
  { href: "/saucerpedia/history", label: "UFOの歴史" },
  { href: "/kinichi", label: "UFO形状辞典 Kinichi", tone: "product" },
  { href: "/kean", label: "現代UAP Kean", tone: "product" },
  { href: "/", label: "UFO Lab Tokyo", tone: "home" },
];

export function AppHeader({ onMenuOpen, view }: { onMenuOpen: () => void; view: SaucerpediaView }) {
  return (
    <header className={styles.appHeader}>
      <Link aria-label="Saucerpedia ホームへ戻る" className={styles.appHeaderBrand} href="/saucerpedia">
        <span className={styles.appHeaderBrandText}>UFO ENCYCLOPEDIA</span>
      </Link>
      <div className={styles.appHeaderActions}>
        <Link
          aria-current={view === "search" ? "page" : undefined}
          className={styles.headerSearchLink}
          href="/saucerpedia/search"
        >
          検索
        </Link>
        <button aria-label="メニューを開く" className={styles.menuButton} onClick={onMenuOpen} type="button">
          ☰
        </button>
      </div>
    </header>
  );
}

export function BottomNav({ view }: { view: SaucerpediaView }) {
  return (
    <nav className={styles.bottomNav} aria-label="主要カテゴリ">
      {bottomNavItems.map((item) => (
        <Link
          aria-current={view === item.view ? "page" : undefined}
          className={view === item.view ? styles.activeBottomNavItem : undefined}
          href={item.href}
          key={item.href}
        >
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function SideDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div className={`${styles.drawerLayer} ${isOpen ? styles.drawerOpen : ""}`} aria-hidden={!isOpen}>
      <button aria-label="メニューを閉じる" className={styles.drawerBackdrop} onClick={onClose} type="button" />
      <aside className={styles.sideDrawer} aria-label="補助カテゴリメニュー">
        <div className={styles.drawerHeader}>
          <button onClick={onClose} tabIndex={isOpen ? undefined : -1} type="button">
            閉じる
          </button>
        </div>
        <nav className={styles.drawerNav}>
          {drawerLinks.map((item) => (
            <Link
              className={item.tone === "home" ? styles.drawerHomeLink : item.tone === "product" ? styles.drawerProductLink : undefined}
              href={item.href}
              key={item.href}
              onClick={onClose}
              tabIndex={isOpen ? undefined : -1}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <small className={styles.drawerCopyright}>© 2026 UFO Lab Tokyo</small>
      </aside>
    </div>
  );
}
