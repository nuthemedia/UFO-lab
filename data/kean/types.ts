export type PersonCategory =
  | "journalist"
  | "whistleblower"
  | "pilot"
  | "government"
  | "senator"
  | "researcher"
  | "skeptic"
  | "filmmaker"
  | "japan-politics"
  | "public-figure"
  | "controversial-claimant";

export type BeginnerTier = "core" | "important" | "context";

export type SourceLink = {
  label: string;
  url: string;
};

export type ImageAsset = {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  license: string;
  sourceUrl: string;
  sourceName: string;
};

export type Person = {
  id: string;
  name: string;
  jaName: string;
  illustration?: ImageAsset;
  portrait?: ImageAsset;
  aliases: string[];
  category: PersonCategory;
  beginnerTier: BeginnerTier;
  oneLine: string;
  whatTheyDid: string[];
  whyImportant: string;
  verifiedFacts: string[];
  claimsOrPositions: string[];
  cautions: string[];
  relatedEvents: string[];
  relatedPeople: string[];
  tags: string[];
  searchQueries: string[];
  sources: SourceLink[];
};

export type RelatedPersonRef = {
  personId: string;
  relationToEvent: string;
};

export type TimelineEvent = {
  id: string;
  chapterNumber: number;
  chapterLabel: string;
  chapterTitle: string;
  visualTheme: string;
  yearLabel: string;
  title: string;
  image?: ImageAsset;
  shortSummary: string;
  whatHappened: string;
  whyImportant: string;
  caution: string;
  relatedPeople: RelatedPersonRef[];
  sources: SourceLink[];
};
