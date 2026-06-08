export type ProceduralType =
  | "sphere"
  | "disk"
  | "dome_saucer"
  | "cigar"
  | "cylinder"
  | "triangle"
  | "boomerang"
  | "tic_tac"
  | "egg"
  | "cone"
  | "diamond"
  | "bell_acorn"
  | "crescent"
  | "delta"
  | "wide_v"
  | "sport_saucer";

export type ShapeGroup = "classic" | "modern" | "light" | "polygonal" | "cigar" | "case-reference";

export type ShapeEntry = {
  id: string;
  nameJa: string;
  nameEn: string;
  shapeGroup: ShapeGroup;
  proceduralType: ProceduralType;
  shortDescription: string;
  features: string[];
  representativeCases: string[];
  misidentifications: string[];
  nuforcShapeIds: string[];
  relatedCraftIds: string[];
  tags: string[];
};

export type FamousCraft = {
  id: string;
  nameJa: string;
  nameEn: string;
  relatedPerson: string;
  relatedCase: string;
  year: string;
  shapeId: string;
  modelPath: string;
  shortDescription: string;
};

export type NuforcShape = {
  id: string;
  name: string;
  nameJa: string;
  sightingCount: number;
  relatedShapeIds: string[];
  sourceLabel: string;
  lastUpdated: string;
};

export type ViewerTarget = {
  id: string;
  label: string;
  modelKind: "procedural" | "glb";
  proceduralType?: ProceduralType;
  modelPath?: string;
};

export const cautionText =
  "この分類は目撃証言・報告データ上の便宜的な分類であり、同じ形状が同一の物体や同一現象を意味するものではありません。掲載する3Dモデルは証言や写真に基づく概念モデルであり、実在物の正確な再現を保証するものではありません。";

export const shapeEntries: ShapeEntry[] = [
  {
    id: "disk",
    nameJa: "円盤型",
    nameEn: "Disk",
    shapeGroup: "classic",
    proceduralType: "disk",
    shortDescription: "古典的UFO像の中心にある、薄い円盤状の形体。",
    features: ["水平な円形外周", "薄い胴体", "遠景では楕円として見えやすい"],
    representativeCases: ["McMinnville UFO photographs", "Rex Heflin / Santa Ana photographs"],
    misidentifications: ["模型写真", "航空機の反射", "投げられた物体", "レンズ内反射"],
    nuforcShapeIds: ["disk", "circle", "oval"],
    relatedCraftIds: ["adamski", "billy-meier"],
    tags: ["古典型", "円盤", "3D", "NUFORC"],
  },
  {
    id: "dome-saucer",
    nameJa: "ドーム型円盤",
    nameEn: "Domed Saucer",
    shapeGroup: "classic",
    proceduralType: "dome_saucer",
    shortDescription: "円盤上部に膨らみを持つ、資料カードでよく描かれる形体。",
    features: ["中央ドーム", "薄い縁", "コンタクティ写真文化と結びつきが強い"],
    representativeCases: ["George Adamski photographs", "Paul Villa photographs"],
    misidentifications: ["照明器具", "模型写真", "金属反射", "加工写真"],
    nuforcShapeIds: ["disk", "oval"],
    relatedCraftIds: ["adamski", "paul-villa"],
    tags: ["古典型", "円盤", "3D"],
  },
  {
    id: "sphere",
    nameJa: "球形 / オーブ",
    nameEn: "Sphere / Orb",
    shapeGroup: "light",
    proceduralType: "sphere",
    shortDescription: "点光源から球体まで、報告上の幅が広い丸い形体。",
    features: ["丸い輪郭", "光として報告されやすい", "距離と大きさを推定しにくい"],
    representativeCases: ["Foo fighter reports", "Mercury mission particles"],
    misidentifications: ["風船", "気球", "ドローン", "金星", "火球", "レンズフレア"],
    nuforcShapeIds: ["light", "sphere", "circle", "fireball"],
    relatedCraftIds: [],
    tags: ["光・球体", "NUFORC", "3D"],
  },
  {
    id: "cigar",
    nameJa: "葉巻型",
    nameEn: "Cigar",
    shapeGroup: "cigar",
    proceduralType: "cigar",
    shortDescription: "細長い胴体を持つ、飛行船や航空機とも比較される形体。",
    features: ["長い胴体", "端部が丸い", "水平移動の証言と相性がよい"],
    representativeCases: ["1896-1897 airship wave", "Adamski cigar-shaped UFO"],
    misidentifications: ["飛行船", "航空機の胴体", "雲", "ロケット", "望遠圧縮"],
    nuforcShapeIds: ["cigar", "cylinder"],
    relatedCraftIds: [],
    tags: ["古典型", "葉巻・筒型", "3D"],
  },
  {
    id: "cylinder",
    nameJa: "シリンダー型",
    nameEn: "Cylinder",
    shapeGroup: "cigar",
    proceduralType: "cylinder",
    shortDescription: "直線的な筒状に見える形体。葉巻型より機械的に描かれる。",
    features: ["筒状の胴体", "平たい端部", "角度により短く見える"],
    representativeCases: ["Cylindrical UFO reports", "Rocket-like UAP descriptions"],
    misidentifications: ["ロケット", "航空機", "気球", "望遠圧縮"],
    nuforcShapeIds: ["cylinder", "cigar"],
    relatedCraftIds: [],
    tags: ["葉巻・筒型", "NUFORC", "3D"],
  },
  {
    id: "triangle",
    nameJa: "三角形",
    nameEn: "Triangle",
    shapeGroup: "polygonal",
    proceduralType: "triangle",
    shortDescription: "夜間報告と頂点ライトのイメージが強い現代的形体。",
    features: ["黒い三角形", "頂点のライト", "低速・低空の証言", "夜間報告が多い"],
    representativeCases: ["Belgian UFO wave", "Black Triangle reports", "Hudson Valley sightings"],
    misidentifications: ["航空機編隊", "軍用機", "ドローン", "星", "照明"],
    nuforcShapeIds: ["triangle", "formation"],
    relatedCraftIds: [],
    tags: ["現代UAP", "多角形", "NUFORC", "3D"],
  },
  {
    id: "phoenix-v",
    nameJa: "フェニックスV字型",
    nameEn: "Phoenix V",
    shapeGroup: "polygonal",
    proceduralType: "wide_v",
    shortDescription: "広いV字・ブーメラン状に報告される大型ライト列の抽象モデル。",
    features: ["横に広いV字", "複数ライト", "巨大な一体物または編隊として語られる"],
    representativeCases: ["Phoenix Lights", "Hudson Valley sightings"],
    misidentifications: ["航空機編隊", "フレア", "大型航空機", "照明列"],
    nuforcShapeIds: ["chevron", "formation", "triangle"],
    relatedCraftIds: [],
    tags: ["現代UAP", "多角形", "事件由来", "3D"],
  },
  {
    id: "boomerang",
    nameJa: "ブーメラン型",
    nameEn: "Boomerang",
    shapeGroup: "polygonal",
    proceduralType: "boomerang",
    shortDescription: "翼状の広がりとして語られる、三角形に近い形体。",
    features: ["V字の翼形", "横に広いシルエット", "編隊や大型機と比較される"],
    representativeCases: ["Hudson Valley sightings", "Phoenix Lights"],
    misidentifications: ["航空機編隊", "大型航空機", "鳥の群れ", "照明列"],
    nuforcShapeIds: ["chevron", "formation"],
    relatedCraftIds: [],
    tags: ["現代UAP", "多角形", "3D"],
  },
  {
    id: "tic-tac",
    nameJa: "Tic Tac型",
    nameEn: "Tic Tac",
    shapeGroup: "modern",
    proceduralType: "tic_tac",
    shortDescription: "白いカプセル状の形体。現代UAP文脈で強い認知を持つ。",
    features: ["白いカプセル形", "翼や尾翼が見えない", "現代UAP映像と関連づく"],
    representativeCases: ["Nimitz Tic Tac encounter", "USS Princeton radar reports"],
    misidentifications: ["航空機", "ドローン", "気球", "映像センサーの見え方"],
    nuforcShapeIds: ["oval", "cylinder", "other"],
    relatedCraftIds: ["tic-tac-craft"],
    tags: ["現代UAP", "有名モデル", "3D"],
  },
  {
    id: "egg",
    nameJa: "卵型",
    nameEn: "Egg",
    shapeGroup: "classic",
    proceduralType: "egg",
    shortDescription: "球形と楕円型の中間にある、丸みの強い卵状の形体。",
    features: ["片側が丸い", "縦長にも横長にも解釈される", "距離で球形と混同されやすい"],
    representativeCases: ["Oval and egg-shaped reports", "Close encounter sketches"],
    misidentifications: ["風船", "気球", "鳥", "レンズ歪み"],
    nuforcShapeIds: ["egg", "oval", "sphere"],
    relatedCraftIds: [],
    tags: ["古典型", "光・球体", "3D"],
  },
  {
    id: "cone",
    nameJa: "円錐型",
    nameEn: "Cone",
    shapeGroup: "classic",
    proceduralType: "cone",
    shortDescription: "漏斗・円錐として描かれる、炎や噴射証言とも結びつく形体。",
    features: ["先端を持つ", "下部が広い", "火球や噴射と混同されやすい"],
    representativeCases: ["Cone-shaped NUFORC reports", "Rocket plume descriptions"],
    misidentifications: ["ロケット", "火球", "照明", "雲"],
    nuforcShapeIds: ["cone", "fireball"],
    relatedCraftIds: [],
    tags: ["古典型", "NUFORC", "3D"],
  },
  {
    id: "diamond",
    nameJa: "ダイヤモンド型",
    nameEn: "Diamond",
    shapeGroup: "case-reference",
    proceduralType: "diamond",
    shortDescription: "上下に頂点を持つ多面体。発光や熱の証言と結びつけられることがある。",
    features: ["上下の尖った輪郭", "面で光を反射する", "夜間では光源として見えやすい"],
    representativeCases: ["Cash-Landrum UFO", "Diamond-shaped reports"],
    misidentifications: ["ヘリコプター照明", "気球", "火球", "航空機ライト"],
    nuforcShapeIds: ["diamond", "fireball"],
    relatedCraftIds: [],
    tags: ["事件由来", "多角形", "3D"],
  },
  {
    id: "kecksburg-acorn",
    nameJa: "釣鐘 / どんぐり型",
    nameEn: "Bell / Acorn",
    shapeGroup: "case-reference",
    proceduralType: "bell_acorn",
    shortDescription: "釣鐘やどんぐり状に語られる、落下物・回収譚と相性の強い形体。",
    features: ["丸い肩", "下部がすぼまる", "落下・回収の文脈で語られる"],
    representativeCases: ["Kecksburg UFO", "Bell-shaped object reports"],
    misidentifications: ["人工衛星破片", "カプセル", "隕石", "軍用機材"],
    nuforcShapeIds: ["other", "unknown"],
    relatedCraftIds: [],
    tags: ["事件由来", "古典型", "3D"],
  },
  {
    id: "arnold-crescent",
    nameJa: "三日月 / 翼状",
    nameEn: "Crescent / Arnold",
    shapeGroup: "case-reference",
    proceduralType: "crescent",
    shortDescription: "Kenneth Arnold報告に関連づけやすい、薄い翼状・三日月状の抽象形体。",
    features: ["薄い翼状", "複数機で語られる", "円盤という語の源流と混同されやすい"],
    representativeCases: ["Kenneth Arnold sighting", "Crescent-shaped reports"],
    misidentifications: ["航空機", "鳥の群れ", "反射", "雲"],
    nuforcShapeIds: ["other", "formation"],
    relatedCraftIds: ["kenneth-arnold"],
    tags: ["事件由来", "古典型", "3D"],
  },
  {
    id: "sport-saucer",
    nameJa: "低背スポーツ円盤",
    nameEn: "Low Saucer",
    shapeGroup: "case-reference",
    proceduralType: "sport_saucer",
    shortDescription: "低い円盤胴体を持つ、滑らかな概念モデル。",
    features: ["低い円盤胴体", "滑らかな下面", "派手な装飾を避けた形体"],
    representativeCases: ["Bob Lazar / Area S4 claims", "Sport model descriptions"],
    misidentifications: ["模型", "CG", "照明器具", "加工写真"],
    nuforcShapeIds: ["disk", "oval"],
    relatedCraftIds: [],
    tags: ["事件由来", "円盤", "3D"],
  },
  {
    id: "black-delta",
    nameJa: "黒いデルタ型",
    nameEn: "Black Delta",
    shapeGroup: "modern",
    proceduralType: "delta",
    shortDescription: "三角形より航空機的な縁を持つ、黒いデルタ翼状の形体。",
    features: ["低いデルタ翼", "暗い材質", "縁とライトで輪郭が決まる"],
    representativeCases: ["Black Triangle reports", "Rendlesham Forest UFO"],
    misidentifications: ["ステルス機", "大型ドローン", "照明列", "軍用機"],
    nuforcShapeIds: ["triangle", "chevron"],
    relatedCraftIds: [],
    tags: ["現代UAP", "多角形", "3D"],
  },
];

export const famousCraft: FamousCraft[] = [
  {
    id: "tic-tac-craft",
    nameJa: "Tic Tac",
    nameEn: "Tic Tac UAP",
    relatedPerson: "David Fravor / USS Nimitz witnesses",
    relatedCase: "Nimitz encounter",
    year: "2004",
    shapeId: "tic-tac",
    modelPath: "/kean/models/tictac/tic_tac_uap_ufo_with_warp_bubble.glb",
    shortDescription: "現代UAP文脈で代表的な白いカプセル状モデル。",
  },
  {
    id: "adamski",
    nameJa: "アダムスキー型",
    nameEn: "Adamski",
    relatedPerson: "George Adamski",
    relatedCase: "Adamski saucer photographs",
    year: "1950s",
    shapeId: "dome-saucer",
    modelPath: "/models/saucers/adamski.glb",
    shortDescription: "コンタクティ文化と結びついた古典的ドーム円盤。",
  },
  {
    id: "paul-villa",
    nameJa: "ポール・ヴィラ型",
    nameEn: "Paul Villa",
    relatedPerson: "Paul Villa",
    relatedCase: "Villa saucer photographs",
    year: "1960s",
    shapeId: "dome-saucer",
    modelPath: "/models/saucers/paul-villa.glb",
    shortDescription: "写真文化の個別モデルとして扱う、明るい金属質の円盤。",
  },
  {
    id: "billy-meier",
    nameJa: "ビリー・マイヤー型",
    nameEn: "Billy Meier",
    relatedPerson: "Billy Meier",
    relatedCase: "Meier beamship photographs",
    year: "1970s",
    shapeId: "disk",
    modelPath: "/models/saucers/billy-meier.glb",
    shortDescription: "1970年代UFO写真文化と結びつく有名モデル。",
  },
  {
    id: "kenneth-arnold",
    nameJa: "ケネス・アーノルド型",
    nameEn: "Kenneth Arnold",
    relatedPerson: "Kenneth Arnold",
    relatedCase: "Kenneth Arnold sighting",
    year: "1947",
    shapeId: "arnold-crescent",
    modelPath: "/models/saucers/kenneth-arnold.glb",
    shortDescription: "1947年の報告に結びつく、薄い翼状・三日月状の有名モデル。",
  },
];

export const nuforcShapes: NuforcShape[] = [
  { id: "light", name: "Light", nameJa: "光点", sightingCount: 29481, relatedShapeIds: ["sphere"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
  { id: "triangle", name: "Triangle", nameJa: "三角形", sightingCount: 15422, relatedShapeIds: ["triangle", "black-delta"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
  { id: "circle", name: "Circle", nameJa: "円形", sightingCount: 12805, relatedShapeIds: ["sphere", "disk"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
  { id: "disk", name: "Disk", nameJa: "円盤", sightingCount: 11972, relatedShapeIds: ["disk", "dome-saucer", "sport-saucer"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
  { id: "sphere", name: "Sphere", nameJa: "球形", sightingCount: 10438, relatedShapeIds: ["sphere", "egg"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
  { id: "oval", name: "Oval", nameJa: "楕円形", sightingCount: 7401, relatedShapeIds: ["tic-tac", "egg"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
  { id: "cigar", name: "Cigar", nameJa: "葉巻型", sightingCount: 3490, relatedShapeIds: ["cigar", "cylinder"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
  { id: "chevron", name: "Chevron", nameJa: "V字型", sightingCount: 1184, relatedShapeIds: ["boomerang", "phoenix-v"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
  { id: "diamond", name: "Diamond", nameJa: "ダイヤ型", sightingCount: 1032, relatedShapeIds: ["diamond"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
  { id: "cone", name: "Cone", nameJa: "円錐型", sightingCount: 788, relatedShapeIds: ["cone"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
  { id: "egg", name: "Egg", nameJa: "卵型", sightingCount: 623, relatedShapeIds: ["egg"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
  { id: "formation", name: "Formation", nameJa: "編隊", sightingCount: 5118, relatedShapeIds: ["phoenix-v", "arnold-crescent"], sourceLabel: "NUFORC", lastUpdated: "2026-06-07" },
];

export const filters = ["すべて", "古典型", "現代UAP", "光・球体", "円盤", "多角形", "葉巻・筒型", "事件由来", "有名モデル", "NUFORC"];

export const productLinks = [
  { label: "Ohtsuki", href: "/ohtsuki", body: "誤認対象と画像判定へ" },
  { label: "Ruppelt", href: "/ruppelt", body: "政府資料と一次文書へ" },
  { label: "Kean", href: "/kean", body: "現代UAP史と人物へ" },
  { label: "Jacques", href: "/jacques", body: "怪異・民俗パターン比較へ" },
];

export function getShapeById(id: string) {
  return shapeEntries.find((shape) => shape.id === id);
}

export function getCraftById(id: string) {
  return famousCraft.find((craft) => craft.id === id);
}

export function getRelatedNuforc(shapeId: string) {
  return nuforcShapes.filter((shape) => shape.relatedShapeIds.includes(shapeId));
}

export function getRelatedCraft(shapeId: string) {
  return famousCraft.filter((craft) => craft.shapeId === shapeId);
}
