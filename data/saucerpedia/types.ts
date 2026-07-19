export type SaucerpediaEntityType =
  | "term"
  | "person"
  | "event"
  | "history"
  | "misidentification"
  | "fake"
  | "resource"
  | "motif"
  | "product";

export type SaucerpediaRelation = {
  type: SaucerpediaEntityType;
  id: string;
  label?: string;
};

// 関連フィールドの要素。文字列はレガシー表記で、knowledge.ts のエイリアス表で
// IDへ解決される。新規データは ID ベースの SaucerpediaRelation を使う。
export type SaucerpediaRelationInput = string | SaucerpediaRelation;

export type SaucerpediaSource = {
  label: string;
  url: string;
  publisher?: string;
  note?: string;
};
