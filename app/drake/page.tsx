import type { Metadata } from "next";
import { DrakeApp } from "@/components/drake/DrakeApp";
import { siteConfig } from "@/lib/site";

const title = "Drake | ドレイクの方程式で考える宇宙人の存在確率とUFO証拠";
const description =
  "ドレイクの方程式とベイズ推論で、宇宙人の存在可能性、地球来訪の事前確率、UFO証拠による更新を考えるインタラクティブ思考実験。";
const ogImage = "/drake/opengraph-image";
const keywords = [
  "ドレイクの方程式",
  "ドレイクの式",
  "宇宙人はいるのか",
  "宇宙人 存在 確率",
  "地球外生命体",
  "地球外知的生命体",
  "UFO 宇宙人 証拠",
  "UFO 地球来訪 確率",
  "ベイズ推論",
  "SETI",
  "フェルミのパラドックス",
  "グレートフィルター",
  "系外惑星",
  "ハビタブルゾーン",
  "バイオシグネチャー",
  "テクノシグネチャー",
  "事前確率",
  "事後確率",
  "尤度比",
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ドレイクの方程式とは何ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ドレイクの方程式は、天の川銀河に通信可能な地球外文明がどれくらいありそうかを、複数の前提に分けて考えるための式です。このアプリでは思考実験として簡略版を使います。",
      },
    },
    {
      "@type": "Question",
      name: "宇宙人が存在することと地球に来ていることは同じですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "同じではありません。Drakeでは、宇宙人や地球外知的生命体が存在する可能性と、地球を発見し、移動し、人類に観測される可能性を分けて考えます。",
      },
    },
    {
      "@type": "Question",
      name: "UFOは宇宙人の証拠になりますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "UFOが未確認であることと、宇宙人由来であることは別の問いです。このアプリでは、UFO証拠の強さを前提として、来訪説への更新量をベイズ推論で考えます。",
      },
    },
    {
      "@type": "Question",
      name: "ベイズ推論はこのアプリで何に使われますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ベイズ推論は、UFO証拠を見る前の来訪可能性を事前確率とし、証拠の強さを尤度比として、証拠を見た後の事後確率へ更新するために使います。",
      },
    },
    {
      "@type": "Question",
      name: "表示される確率は科学的な結論ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "科学的な最終結論ではありません。表示される確率は、ユーザーが置いた前提に基づく思考実験としての値です。",
      },
    },
  ],
};

export const metadata: Metadata = {
  title,
  description,
  keywords,
  applicationName: "Drake",
  alternates: {
    canonical: "/drake",
  },
  openGraph: {
    title,
    description,
    url: "/drake",
    siteName: siteConfig.shortName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Drake - 宇宙人はいるのか、地球に来ているのか",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

export default function DrakePage() {
  return (
    <>
      <DrakeApp />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
