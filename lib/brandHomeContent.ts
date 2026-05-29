import { ohtsukiConfig, siteConfig } from "@/lib/site";

export type BrandLocale = "ja" | "en";

export const brandSiteUrl = "https://ufolab.tokyo";
export const brandOgpImage = "/ogp-brand.jpg";

export const brandHomeContent = {
  ja: {
    htmlLang: "ja",
    path: "/",
    alternatePath: "/en",
    alternateLabel: "English",
    currentLabel: "日本語",
    meta: {
      title: "UFO Lab Tokyo - 東京UFO研究室",
      description: "UFOコミュニティに貢献する各種アプリを開発する研究室。",
    },
    logo: siteConfig.shortName,
    taglines: {
      primaryDesktop: siteConfig.tagline,
      primaryMobile: ["UFOはまだ解明されていないが", "確かに実在する現象である"],
      secondaryDesktop: "UFOs are phenomena that remain unexplained, yet undeniably exist.",
      secondaryMobile: ["UFOs remain unexplained,", "yet undeniably exist."],
    },
    mission: "テクノロジーの魔法で、UFOコミュニティに貢献する",
    featuredApp: {
      name: "Ruppelt",
      description: "UFO米国政府機密解除情報の日本語リーダー",
      note: "🔴 Ruppeltとは？",
      noteHref: "/ruppelt/lp",
    },
    challengesHeading: "UFO Lab Tokyo が解決する課題",
    challenges: [
      {
        title: "フェイクの氾濫",
        description: "AI画像・AI動画、誤情報、切り抜きの増加。",
      },
      {
        title: "読みにくい一次情報",
        description: "公開資料はあるが、探しにくく、読みづらい。",
      },
      {
        title: "海外コミュニティとの壁",
        description: "言語の問題。他国へ向けた情報発信の欠如。",
      },
      {
        title: "断片化する情報",
        description: "人物、事件、資料、歴史のつながりが見えにくい。",
      },
      {
        title: "ユーフォロジーの断絶",
        description: "過去のUFO研究が、現代の議論につながりにくい。",
      },
    ],
    update: "Hynek v1と日本のUFO観ダッシュボードを追加しました。",
    updateFeedback: {
      heading: "更新情報・フィードバック",
      body: [
        "今後も新しいアプリを追加していきます。",
        "更新情報はXで発信しているので、ぜひフォローしてください。",
      ],
      cta: "Xをフォロー",
    },
    products: [
      {
        version: "Version 1.0",
        name: "Hynek v1",
        title: "Hynek v1 – UFOファンタイプ診断",
        href: "/hynek",
        cta: "Hynekを開く",
      },
      {
        version: "Dashboard",
        name: "日本のUFO観",
        title: "日本のUFO観ダッシュボード",
        href: "/hynek/dashboard",
        cta: "ダッシュボードを見る",
      },
      {
        version: "Version 1.1",
        name: "Ruppelt v1.1",
        title: "Ruppelt v1.1 – PURSUE日本語インデックス",
        href: "/ruppelt",
        cta: "Ruppeltを開く",
      },
      {
        version: "Version 0.5 Beta",
        name: ohtsukiConfig.name,
        title: `${ohtsukiConfig.name} – ${ohtsukiConfig.label}`,
        href: "/ohtsuki",
        cta: "Ohtsukiを開く",
      },
    ],
    footer: {
      homeHref: "/",
      brand: "UFO Lab Tokyo - 東京UFO研究室",
      rights: "UFO Lab Tokyo All rights reserved",
      copyright: "© 2026 東京UFO研究室",
      feedback: "更新情報・フィードバックは→",
    },
  },
  en: {
    htmlLang: "en",
    path: "/en",
    alternatePath: "/",
    alternateLabel: "日本語",
    currentLabel: "English",
    meta: {
      title: "UFO Lab Tokyo",
      description: "A research lab developing apps that contribute to the UFO community.",
    },
    logo: siteConfig.shortName,
    taglines: {
      primaryDesktop: "UFOs are phenomena that remain unexplained, yet undeniably exist.",
      primaryMobile: ["UFOs remain unexplained,", "yet undeniably exist."],
      secondaryDesktop: "",
      secondaryMobile: [],
    },
    mission: "Contributing to the UFO community through the magic of technology.",
    featuredApp: {
      name: "Ruppelt",
      description: "A Japanese reader for declassified UFO records from the U.S. government.",
      note: "🔴 What is Ruppelt?",
      noteHref: "/ruppelt/lp",
    },
    challengesHeading: "Challenges UFO Lab Tokyo Takes On",
    challenges: [
      {
        title: "Proliferation of Fakes",
        description:
          "The rise of AI-generated images and videos, misinformation, and misleading edits.",
      },
      {
        title: "Unreadable Primary Sources",
        description: "Public records exist, but they are hard to find and difficult to read.",
      },
      {
        title: "Barriers with Overseas Communities",
        description: "Language issues. A lack of outreach to other countries.",
      },
      {
        title: "Fragmented Information",
        description:
          "Connections between people, cases, documents, and history are hard to see.",
      },
      {
        title: "A Break in Ufology",
        description: "Past UFO research does not easily connect to today's discussion.",
      },
    ],
    update: "Added Hynek v1 and the Japan UFO View Dashboard.",
    updateFeedback: {
      heading: "Updates & Feedback",
      body: [
        "We will keep adding new apps.",
        "We share updates on X, so please follow us there.",
      ],
      cta: "Follow on X",
    },
    products: [
      {
        version: "Version 1.0",
        name: "Hynek v1",
        title: "Hynek v1 – UFO Fan Type Quiz",
        href: "/hynek",
        cta: "Open Hynek",
      },
      {
        version: "Dashboard",
        name: "Japan UFO View",
        title: "Japan UFO View Dashboard",
        href: "/hynek/dashboard",
        cta: "View Dashboard",
      },
      {
        version: "Version 1.1",
        name: "Ruppelt v1.1",
        title: "Ruppelt v1.1 – UAP Public Records Viewer",
        href: "/ruppelt",
        cta: "Open Ruppelt",
      },
      {
        version: "Version 0.5 Beta",
        name: ohtsukiConfig.name,
        title: `${ohtsukiConfig.name} – UFO AI Image Checker`,
        href: "/ohtsuki",
        cta: "Open Ohtsuki",
      },
    ],
    footer: {
      homeHref: "/en",
      brand: "UFO Lab Tokyo",
      rights: "UFO Lab Tokyo All rights reserved",
      copyright: "© 2026 UFO Lab Tokyo",
      feedback: "Updates & feedback →",
    },
  },
} as const;
