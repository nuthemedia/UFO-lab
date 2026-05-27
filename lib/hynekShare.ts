export type HynekShareGender = "male" | "female";

export type HynekShareResultType =
  | "evidence"
  | "cautious"
  | "romantic"
  | "witness"
  | "wonder"
  | "news"
  | "entertainment"
  | "contact";

export const hynekResultImagePaths: Record<HynekShareResultType, Record<HynekShareGender, string>> = {
  evidence: {
    male: "/hynek/evidence-male.png",
    female: "/hynek/evidence-female.png",
  },
  cautious: {
    male: "/hynek/cautious-male.png",
    female: "/hynek/cautious-female.png",
  },
  romantic: {
    male: "/hynek/romantic-male.png",
    female: "/hynek/romantic-female.png",
  },
  witness: {
    male: "/hynek/witness-male.png",
    female: "/hynek/witness-female.png",
  },
  wonder: {
    male: "/hynek/wonder-male.png",
    female: "/hynek/wonder-female.png",
  },
  news: {
    male: "/hynek/news-male.png",
    female: "/hynek/news-female.png",
  },
  entertainment: {
    male: "/hynek/entertainment-male.png",
    female: "/hynek/entertainment-female.png",
  },
  contact: {
    male: "/hynek/contact-male.png",
    female: "/hynek/contact-female.png",
  },
};

export const hynekResultLabels: Record<HynekShareResultType, string> = {
  evidence: "証拠重視UFOファン",
  cautious: "慎重派UFOファン",
  romantic: "ロマン派UFOファン",
  witness: "目撃体験重視派",
  wonder: "不思議好きUFOファン",
  news: "ニュース追跡派",
  entertainment: "エンタメUFOファン",
  contact: "接触・メッセージ関心派",
};

export const HYNEK_SOCIAL_IMAGE_VERSION = "2";

export function getHynekShareImagePath(resultType?: string, gender?: string) {
  if (
    !resultType ||
    !(resultType in hynekResultImagePaths) ||
    (gender !== "male" && gender !== "female")
  ) {
    return null;
  }

  return hynekResultImagePaths[resultType as HynekShareResultType][gender];
}

export function getHynekShareLabel(resultType?: string) {
  if (!resultType || !(resultType in hynekResultLabels)) {
    return null;
  }

  return hynekResultLabels[resultType as HynekShareResultType];
}

export function withHynekSocialImageVersion(url: string) {
  const [baseUrl, hash = ""] = url.split("#");
  const [path, query = ""] = baseUrl.split("?");
  const params = new URLSearchParams(query);
  params.set("v", HYNEK_SOCIAL_IMAGE_VERSION);

  const nextUrl = `${path}?${params.toString()}`;
  return hash ? `${nextUrl}#${hash}` : nextUrl;
}
