import type { ImageAsset, Person } from "../data/kean/types";

export function makeKeanPortraitAsset(person: Pick<Person, "id" | "name" | "jaName" | "category">): ImageAsset {
  const sourcePath = `/kean/images/people/illustrations/${person.id}.png`;

  return {
    src: `${sourcePath}?v=4`,
    alt: `${person.name}のKean資料イラスト`,
    caption: `${person.jaName}のKean資料イラスト。`,
    credit: "Kean図版",
    license: "Original generated illustration",
    sourceUrl: sourcePath,
    sourceName: "Kean generated portrait",
  };
}

export function getKeanPersonIllustration(
  person: Pick<Person, "illustration">,
): ImageAsset | undefined {
  return person.illustration;
}
