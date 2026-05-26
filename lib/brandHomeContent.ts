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
        title: "英語の壁",
        description: "重要なUAP情報が英語圏に偏っている。",
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
    update: "Ruppelt v1.1にファイルの公開情報が追加されました。",
    products: [
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
      feedback: "アプリのフィードバックはこちら→",
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
        title: "Language Barriers",
        description: "Important UAP information is concentrated in English-speaking spaces.",
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
    update: "Ruppelt v1.1 now includes public file disclosure information.",
    products: [
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
      feedback: "App feedback →",
    },
  },
} as const;
