export type JacquesCategory =
  | "ufo"
  | "aerial_phenomenon"
  | "fairy_tale"
  | "kamikakushi"
  | "religious_vision"
  | "contactee"
  | "folklore";

export type JacquesCard = {
  id: string;
  title: string;
  displayTitle: string;
  category: JacquesCategory;
  yearLabel: string;
  locationLabel: string;
  cultureArea?: string;
  shortSummary: string;
  description: string;
  motifs: string[];
  image?: string;
  valleeRelation?: string;
  certaintyLevel?: "high" | "medium" | "low";
  wikiLinks?: {
    label: string;
    url: string;
  }[];
};

export type JacquesConnection = {
  id: string;
  fromCardId: string;
  toCardId: string;
  connectionTitle: string;
  connectionSummary: string;
  adoptionStatus: "adopt" | "hold" | "exclude";
  relationBasis:
    | "vallee_explicit"
    | "vallee_related"
    | "editorial_candidate"
    | "needs_source_check";
  cautionLevel: "low" | "medium" | "high";
  displayMode: "education" | "exploration" | "hidden";
  connectionShape: "pair" | "cluster" | "motif_group" | "graph_only";
  sharedMotifs: string[];
  uiPoint: string;
  skepticNote?: string;
  faithContextNote?: string;
  needsVerification: boolean;
};

export const jacquesCards: JacquesCard[] = [
  {
    id: "joe-simonton",
    title: "Joe Simonton encounter",
    displayTitle: "シモントン事件",
    category: "ufo",
    yearLabel: "1961",
    locationLabel: "ウィスコンシン州イーグルリバー",
    cultureArea: "アメリカ",
    shortSummary: "小型の着陸物体と乗員、食べ物の授受が語られるUFO接触事例。",
    description:
      "ジョー・シモントンが自宅近くで着陸物体と小柄な存在に遭遇し、パンケーキ状の食べ物を受け取ったとされる事例。Jacques では、食べ物、塩、水、歓待のモチーフを比較する起点カードとして扱う。",
    image: "/images/jacques/joe-simonton.png",
    motifs: ["小柄な存在", "食べ物の授受", "塩", "物的サンプル", "着陸", "不条理な行動"],
    valleeRelation: "Passport to Magonia の代表的比較事例として扱う。",
    certaintyLevel: "high",
  },
  {
    id: "fairy-food-salt",
    title: "Fairy food and salt",
    displayTitle: "妖精の食べ物と塩",
    category: "fairy_tale",
    yearLabel: "伝承",
    locationLabel: "ブリテン諸島ほか",
    cultureArea: "西欧民間伝承",
    shortSummary: "妖精の食べ物、塩を避ける存在、異界の食事に関する伝承群。",
    description:
      "民間伝承では、異界の食べ物を食べること、塩を嫌う存在、食事を通じた境界の変化が語られる。Jacques では、UFO接触譚に現れる食べ物モチーフとの構造的類似を見る。",
    image: "/images/jacques/fairy-food-salt.png",
    motifs: ["異界の食べ物", "塩", "歓待", "境界", "伝承"],
    valleeRelation: "ヴァレの妖精譚比較の文脈で扱う。",
    certaintyLevel: "medium",
    wikiLinks: [
      {
        label: "妖精",
        url: "https://ja.wikipedia.org/wiki/%E5%A6%96%E7%B2%BE",
      },
    ],
  },
  {
    id: "airship-1897",
    title: "1897 American airship wave",
    displayTitle: "1897年アメリカ空中船ウェーブ",
    category: "aerial_phenomenon",
    yearLabel: "1896-1897",
    locationLabel: "アメリカ各地",
    cultureArea: "アメリカ",
    shortSummary: "空中船、操縦者、修理、水の要求などが語られた近代初期の空中現象。",
    description:
      "19世紀末の新聞報道で広がった空中船目撃の波。操縦者や修理中の乗り物、水を求める訪問者など、後のUFO接触譚と比較しやすいモチーフを含む。",
    image: "/images/jacques/airship-1897.png",
    motifs: ["空から来る乗り物", "水の要求", "修理", "訪問者", "群衆目撃"],
    valleeRelation: "古い空中現象と現代UFOの連続性を考える材料。",
    certaintyLevel: "medium",
    wikiLinks: [
      {
        label: "謎の飛行船",
        url: "https://ja.wikipedia.org/wiki/%E8%AC%8E%E3%81%AE%E9%A3%9B%E8%A1%8C%E8%88%B9",
      },
    ],
  },
  {
    id: "fairy-hospitality",
    title: "Fairy hospitality",
    displayTitle: "妖精の歓待 / 共食儀礼",
    category: "fairy_tale",
    yearLabel: "伝承",
    locationLabel: "欧州各地",
    cultureArea: "民間伝承",
    shortSummary: "異界の相手との食事、もてなし、贈与が境界を変える伝承群。",
    description:
      "妖精譚では、食べ物やもてなしが異界との接触を示す装置として現れる。Jacques では、接触者が食べ物を受け取るUFO事例と並べる。",
    image: "/images/jacques/fairy-hospitality.png",
    motifs: ["歓待", "共食", "贈り物", "異界の食べ物", "境界"],
    certaintyLevel: "medium",
    wikiLinks: [
      {
        label: "妖精",
        url: "https://ja.wikipedia.org/wiki/%E5%A6%96%E7%B2%BE",
      },
    ],
  },
  {
    id: "rhys-llewellyn",
    title: "Rhys and Llewellyn",
    displayTitle: "リースとルウェリン",
    category: "fairy_tale",
    yearLabel: "伝承",
    locationLabel: "ウェールズ",
    cultureArea: "ケルト伝承",
    shortSummary: "妖精の輪、異界訪問、帰還後の時間のずれを扱う伝承。",
    description:
      "妖精の領域へ入った者が、本人の感覚とは異なる時間経過の後に戻るという伝承。UFO abduction の missing time と比較しやすい。",
    image: "/images/jacques/rhys-llewellyn.png",
    motifs: ["時間異常", "異界訪問", "記憶の欠落", "連れ去り", "境界"],
    valleeRelation: "時間のずれをめぐる比較対象として扱う。",
    certaintyLevel: "high",
    wikiLinks: [
      {
        label: "妖精の輪",
        url: "https://ja.wikipedia.org/wiki/%E5%A6%96%E7%B2%BE%E3%81%AE%E8%BC%AA",
      },
    ],
  },
  {
    id: "hill-abduction",
    title: "Betty and Barney Hill",
    displayTitle: "ベティ＆バーニー・ヒル事件",
    category: "ufo",
    yearLabel: "1961",
    locationLabel: "ニューハンプシャー州",
    cultureArea: "アメリカ",
    shortSummary: "UFO abduction と missing time の代表的事例として知られる。",
    description:
      "ベティ＆バーニー・ヒル夫妻の体験は、時間喪失、車での移動中の遭遇、後年の証言で知られる。Jacques では、妖精譚の時間のずれとの構造的類似を見る。",
    image: "/images/jacques/hill-abduction.png",
    motifs: ["時間異常", "記憶の欠落", "連れ去り", "光", "移動中の遭遇"],
    certaintyLevel: "medium",
    wikiLinks: [
      {
        label: "ヒル夫妻誘拐事件",
        url: "https://ja.wikipedia.org/wiki/%E3%83%92%E3%83%AB%E5%A4%AB%E5%A6%BB%E8%AA%98%E6%8B%90%E4%BA%8B%E4%BB%B6",
      },
    ],
  },
  {
    id: "villas-boas",
    title: "Antonio Villas-Boas",
    displayTitle: "アントニオ・ヴィラス＝ボアス事件",
    category: "contactee",
    yearLabel: "1957",
    locationLabel: "ブラジル",
    cultureArea: "南米",
    shortSummary: "時間のずれや接触者体験として比較されるUFO事例。",
    description:
      "アントニオ・ヴィラス＝ボアス事件は、接触者体験と時間異常の比較候補として扱う。Jacques では、異界訪問的な構造と時間のずれに注目する。",
    image: "/images/jacques/villas-boas.png",
    motifs: ["時間異常", "空中移送", "接触", "孤立した目撃"],
    certaintyLevel: "medium",
    wikiLinks: [
      {
        label: "アントニオ・ヴィラス＝ボアス",
        url: "https://en.wikipedia.org/wiki/Antonio_Villas-Boas",
      },
    ],
  },
  {
    id: "agobard-magonia",
    title: "Agobard and Magonia",
    displayTitle: "アゴバールのマゴニアと雲の船",
    category: "aerial_phenomenon",
    yearLabel: "9世紀",
    locationLabel: "リヨン周辺",
    cultureArea: "中世ヨーロッパ",
    shortSummary: "雲から来る船や空の国 Magonia をめぐる古い空中現象の記録。",
    description:
      "Agobard が批判的に記したとされる、Magonia から来る雲の船や空中の乗り物をめぐる伝承。近代の空中船ウェーブと並べやすい。",
    image: "/images/jacques/agobard-magonia.png",
    motifs: ["雲", "空飛ぶ船", "空から来る乗り物", "群衆目撃"],
    valleeRelation: "Passport to Magonia の題名にも関わる中核的参照。",
    certaintyLevel: "high",
    wikiLinks: [
      {
        label: "マゴニア",
        url: "https://ja.wikipedia.org/wiki/%E3%83%9E%E3%82%B4%E3%83%8B%E3%82%A2",
      },
    ],
  },
  {
    id: "merkel-anchor",
    title: "Merkel anchor incident",
    displayTitle: "メルケルのアンカー事件",
    category: "aerial_phenomenon",
    yearLabel: "中世伝承",
    locationLabel: "ヨーロッパ",
    cultureArea: "中世ヨーロッパ",
    shortSummary: "空中の船からアンカーが降りたとされる伝承的事例。",
    description:
      "空から来る船、アンカー、地上との一時的接触が語られる伝承。雲船アンカーの類型として比較する。",
    image: "/images/jacques/merkel-anchor.png",
    motifs: ["空飛ぶ船", "アンカー", "接触不能の実体", "群衆目撃"],
    valleeRelation: "古い空中船伝承の比較対象。",
    certaintyLevel: "medium",
    wikiLinks: [
      {
        label: "空飛ぶ船",
        url: "https://ja.wikipedia.org/wiki/%E7%A9%BA%E9%A3%9B%E3%81%B6%E8%88%B9",
      },
    ],
  },
  {
    id: "cloera-gravesend-anchor",
    title: "Cloera / Gravesend cloudship anchor",
    displayTitle: "クロエラ / グレーブセンドの雲船アンカー伝承",
    category: "folklore",
    yearLabel: "伝承",
    locationLabel: "アイルランド / イングランド",
    cultureArea: "西欧伝承",
    shortSummary: "雲の船とアンカーが地上に関わる類似伝承。",
    description:
      "雲の船からアンカーが降りる、あるいは空中の船が地上と接触する伝承群。Jacques では Merkel のアンカー事件との比較に使う。",
    image: "/images/jacques/cloera-gravesend-anchor.png",
    motifs: ["雲", "空飛ぶ船", "アンカー", "接触不能の実体"],
    certaintyLevel: "medium",
    wikiLinks: [
      {
        label: "空飛ぶ船",
        url: "https://ja.wikipedia.org/wiki/%E7%A9%BA%E9%A3%9B%E3%81%B6%E8%88%B9",
      },
    ],
  },
  {
    id: "knock-apparition",
    title: "Knock apparition",
    displayTitle: "ノックの聖母出現",
    category: "religious_vision",
    yearLabel: "1879",
    locationLabel: "アイルランド Knock",
    cultureArea: "カトリック信仰",
    shortSummary: "発光、出現、群衆目撃を含む信仰上重要な宗教的出来事。",
    description:
      "Knock の聖母出現は信仰上重要な出来事として扱われる。Jacques では信仰的意味を否定せず、発光現象、群衆目撃、治癒の構造的類似だけを比較する。",
    image: "/images/jacques/knock-apparition.png",
    motifs: ["発光現象", "発光存在", "群衆目撃", "治癒", "宗教的幻視"],
    certaintyLevel: "high",
    wikiLinks: [
      {
        label: "ノックの聖母出現",
        url: "https://en.wikipedia.org/wiki/Knock_Shrine",
      },
    ],
  },
  {
    id: "damon-healing-light",
    title: "Damon healing light",
    displayTitle: "デイモンの治癒光",
    category: "ufo",
    yearLabel: "20世紀",
    locationLabel: "要確認",
    cultureArea: "UFO事例",
    shortSummary: "光と治癒をめぐるUFO側の比較候補。",
    description:
      "発光現象と治癒が結びつく事例として、宗教的幻視との構造的類似を検討するための候補。詳細な原典確認が必要。",
    image: "/images/jacques/damon-healing-light.png",
    motifs: ["発光現象", "治癒", "接触", "要原本確認"],
    certaintyLevel: "low",
  },
  {
    id: "guadalupe-apparition",
    title: "Our Lady of Guadalupe",
    displayTitle: "グアダルーペの聖母出現",
    category: "religious_vision",
    yearLabel: "1531",
    locationLabel: "メキシコ",
    cultureArea: "カトリック信仰 / メソアメリカ",
    shortSummary: "贈り物、しるし、変換された証拠を含む信仰上重要な出来事。",
    description:
      "Guadalupe の聖母出現は信仰上重要な出来事として扱われる。Jacques では、贈り物やしるしが別の形で現れる構造だけを比較する。",
    image: "/images/jacques/guadalupe-apparition.png",
    motifs: ["贈り物", "しるし", "変換", "宗教的幻視"],
    certaintyLevel: "high",
    wikiLinks: [
      {
        label: "グアダルーペの聖母",
        url: "https://ja.wikipedia.org/wiki/%E3%82%B0%E3%82%A2%E3%83%80%E3%83%AB%E3%83%BC%E3%83%9A%E3%81%AE%E8%81%96%E6%AF%8D",
      },
    ],
  },
  {
    id: "fairy-gift-transformation",
    title: "Fairy gift transformation",
    displayTitle: "妖精の贈り物変換",
    category: "fairy_tale",
    yearLabel: "伝承",
    locationLabel: "欧州各地",
    cultureArea: "民間伝承",
    shortSummary: "贈り物や証拠が後で別の性質を帯びる伝承群。",
    description:
      "妖精譚では、贈り物が葉や石へ変わる、逆に価値を持つものへ変わるなど、証拠の変換が語られる。Jacques では Guadalupe のしるしと構造的に比較する。",
    image: "/images/jacques/fairy-gift-transformation.png",
    motifs: ["贈り物", "しるし", "変換", "異界"],
    certaintyLevel: "medium",
    wikiLinks: [
      {
        label: "妖精",
        url: "https://ja.wikipedia.org/wiki/%E5%A6%96%E7%B2%BE",
      },
    ],
  },
  {
    id: "maurice-masse",
    title: "Maurice Masse / Valensole",
    displayTitle: "モーリス・マス / ヴァランソール事件",
    category: "ufo",
    yearLabel: "1965",
    locationLabel: "フランス Valensole",
    cultureArea: "欧州UFO事例",
    shortSummary: "小柄な存在、着陸痕、局所的物理異常が語られる事例。",
    description:
      "モーリス・マスが農地で小型の存在と物体に遭遇したとされる事例。デヴィルド事件やソコロUFO事件と比較しやすい着陸、痕跡、小柄な存在のモチーフを持つ。",
    image: "/images/jacques/maurice-masse.png",
    motifs: ["小柄な存在", "着陸", "痕跡", "局所的な物理異常", "麻痺"],
    certaintyLevel: "medium",
    wikiLinks: [
      {
        label: "ヴァランソール事件",
        url: "https://en.wikipedia.org/wiki/Valensole_UFO_incident",
      },
    ],
  },
  {
    id: "marius-dewilde",
    title: "Marius Dewilde",
    displayTitle: "マリウス・デヴィルド事件",
    category: "ufo",
    yearLabel: "1954",
    locationLabel: "フランス Quarouble",
    cultureArea: "欧州UFO事例",
    shortSummary: "小柄な存在、光、鉄道付近の痕跡を含むフランスのUFO事例。",
    description:
      "Dewilde 事件は小柄な存在、発光、痕跡のモチーフで知られる。Masse との比較では、近接遭遇の反復パターンに注目する。",
    image: "/images/jacques/marius-dewilde.png",
    motifs: ["小柄な存在", "光", "痕跡", "局所的な物理異常"],
    certaintyLevel: "medium",
    wikiLinks: [
      {
        label: "マリウス・デヴィルド",
        url: "https://en.wikipedia.org/wiki/Marius_Dewilde",
      },
    ],
  },
  {
    id: "socorro-zamora",
    title: "Socorro / Lonnie Zamora",
    displayTitle: "ソコロUFO事件",
    category: "ufo",
    yearLabel: "1964",
    locationLabel: "ニューメキシコ州ソコロ",
    cultureArea: "アメリカ",
    shortSummary: "着陸物体、小柄な存在、痕跡で知られる近接遭遇事例。",
    description:
      "Lonnie Zamora 巡査の目撃として知られ、着陸痕や小柄な存在の報告が比較対象になりやすい。v0では編集上の比較候補として扱う。",
    image: "/images/jacques/socorro-zamora.png",
    motifs: ["小柄な存在", "着陸", "痕跡", "発光現象"],
    certaintyLevel: "medium",
    wikiLinks: [
      {
        label: "ソコロUFO事件",
        url: "https://ja.wikipedia.org/wiki/%E3%82%BD%E3%82%B3%E3%83%ADUFO%E4%BA%8B%E4%BB%B6",
      },
    ],
  },
  {
    id: "georgian-bay-water",
    title: "Georgian Bay underwater replenishment",
    displayTitle: "ジョージアン湾の水中補給",
    category: "ufo",
    yearLabel: "20世紀",
    locationLabel: "ジョージアン湾",
    cultureArea: "北米UFO事例",
    shortSummary: "水や補給をめぐるUFO側の比較候補。",
    description:
      "水の要求や補給モチーフを、Simonton や1897年空中船ウェーブと束ねるための候補。出典の精査が必要。",
    image: "/images/jacques/georgian-bay-water.png",
    motifs: ["水の要求", "補給", "空から来る乗り物", "要原本確認"],
    certaintyLevel: "low",
  },
  {
    id: "raveo-dwarfs",
    title: "Raveo dwarfs",
    displayTitle: "ラヴェオの小人事件",
    category: "ufo",
    yearLabel: "1947",
    locationLabel: "イタリア Raveo",
    cultureArea: "欧州UFO事例",
    shortSummary: "小柄な存在の比較候補として使える初期UFO事例。",
    description:
      "小柄な存在の反復モチーフを Masse や Dewilde と束ねる候補。初期データでは要原本確認ラベル付きで扱う。",
    image: "/images/jacques/raveo-dwarfs.png",
    motifs: ["小柄な存在", "近接遭遇", "要原本確認"],
    certaintyLevel: "low",
  },
];

const faithContextNote =
  "このカードは信仰上重要な宗教的出来事を扱う。Jacquesでは、その信仰的意味を否定せず、構造的類似のみを比較する。";

export const jacquesConnections: JacquesConnection[] = [
  {
    id: "simonton-fairy-food-salt",
    fromCardId: "joe-simonton",
    toCardId: "fairy-food-salt",
    connectionTitle: "食べ物と塩の境界",
    connectionSummary:
      "食べ物の授受と塩をめぐるモチーフが、UFO接触譚と妖精譚のあいだで比較される。",
    adoptionStatus: "adopt",
    relationBasis: "vallee_explicit",
    cautionLevel: "low",
    displayMode: "education",
    connectionShape: "pair",
    sharedMotifs: ["食べ物の授受", "異界の食べ物", "塩", "小柄な存在"],
    uiPoint: "パンケーキ状の食べ物と妖精の食物禁忌を、同じカード上で見比べられる。",
    skepticNote: "食べ物という共通点だけで同一現象と見なさず、伝承上の役割に注目する。",
    needsVerification: false,
  },
  {
    id: "simonton-airship-water",
    fromCardId: "joe-simonton",
    toCardId: "airship-1897",
    connectionTitle: "水を求める訪問者",
    connectionSummary:
      "訪問者が水や補給を求める構造を、Simonton と1897年空中船ウェーブで比較する。",
    adoptionStatus: "adopt",
    relationBasis: "needs_source_check",
    cautionLevel: "medium",
    displayMode: "exploration",
    connectionShape: "cluster",
    sharedMotifs: ["水の要求", "訪問者", "空から来る乗り物", "不条理な行動"],
    uiPoint: "食べ物だけでなく、水や補給という生活的なモチーフへ広げられる。",
    skepticNote: "1897年空中船報道は新聞記事や民間伝承化した要素が混在するため、原典確認が必要。",
    needsVerification: true,
  },
  {
    id: "simonton-fairy-hospitality",
    fromCardId: "joe-simonton",
    toCardId: "fairy-hospitality",
    connectionTitle: "歓待と共食の接触儀礼",
    connectionSummary:
      "異界の相手と食べ物をやり取りする行為を、接触を成立させる儀礼的構造として見る。",
    adoptionStatus: "adopt",
    relationBasis: "vallee_explicit",
    cautionLevel: "medium",
    displayMode: "education",
    connectionShape: "cluster",
    sharedMotifs: ["歓待", "共食", "食べ物の授受", "異界の食べ物"],
    uiPoint: "シモントン事件を起点に、食べ物・塩・歓待をまとめて表示できる。",
    skepticNote: "共食は多くの伝承に広く見られるため、個別事例の近さを過大評価しない。",
    needsVerification: false,
  },
  {
    id: "rhys-hill-missing-time",
    fromCardId: "rhys-llewellyn",
    toCardId: "hill-abduction",
    connectionTitle: "Elfland の時間ずれと missing time",
    connectionSummary:
      "異界訪問後の時間のずれと、UFO abduction で語られる missing time を比較する。",
    adoptionStatus: "adopt",
    relationBasis: "vallee_explicit",
    cautionLevel: "medium",
    displayMode: "education",
    connectionShape: "pair",
    sharedMotifs: ["時間異常", "記憶の欠落", "連れ去り", "異界訪問"],
    uiPoint: "時間のずれという強いモチーフを、伝承とUFO事例の両方で見せられる。",
    skepticNote: "この接続では、伝承とUFO事例に共通する時間喪失の構造だけを見る。",
    needsVerification: false,
  },
  {
    id: "rhys-villas-boas-time",
    fromCardId: "rhys-llewellyn",
    toCardId: "villas-boas",
    connectionTitle: "異界訪問と時間異常",
    connectionSummary:
      "本人の主観的時間と外部時間のずれを、妖精譚と接触者体験の比較候補として扱う。",
    adoptionStatus: "adopt",
    relationBasis: "vallee_related",
    cautionLevel: "medium",
    displayMode: "exploration",
    connectionShape: "cluster",
    sharedMotifs: ["時間異常", "異界訪問", "空中移送", "孤立した目撃"],
    uiPoint: "リースとルウェリンを起点に、時間喪失の周辺接続を複数ぶら下げられる。",
    skepticNote: "この接続では、接触者体験に現れる時間のずれだけを見る。",
    needsVerification: false,
  },
  {
    id: "knock-damon-healing",
    fromCardId: "knock-apparition",
    toCardId: "damon-healing-light",
    connectionTitle: "治癒を伴う光",
    connectionSummary:
      "発光現象と治癒が結びつく構造を、宗教的幻視とUFO側の事例で比較する。",
    adoptionStatus: "adopt",
    relationBasis: "vallee_explicit",
    cautionLevel: "medium",
    displayMode: "education",
    connectionShape: "pair",
    sharedMotifs: ["発光現象", "治癒", "発光存在", "群衆目撃"],
    uiPoint: "宗教的幻視を尊重しつつ、光と治癒のモチーフだけを比較できる。",
    skepticNote: "信仰上の意味をUFO説明へ置き換えない。",
    faithContextNote,
    needsVerification: false,
  },
  {
    id: "knock-guadalupe",
    fromCardId: "knock-apparition",
    toCardId: "guadalupe-apparition",
    connectionTitle: "宗教的幻視におけるしるし",
    connectionSummary:
      "群衆目撃、しるし、信仰共同体での受容という構造を、宗教的出来事同士で比較する。",
    adoptionStatus: "adopt",
    relationBasis: "needs_source_check",
    cautionLevel: "medium",
    displayMode: "exploration",
    connectionShape: "cluster",
    sharedMotifs: ["宗教的幻視", "しるし", "群衆目撃", "発光現象"],
    uiPoint: "宗教的幻視カード同士を、UFO化せずに構造比較できる。",
    skepticNote: "異なる信仰史と地域文脈を単純に同列化しない。",
    faithContextNote,
    needsVerification: true,
  },
  {
    id: "guadalupe-fairy-gift",
    fromCardId: "guadalupe-apparition",
    toCardId: "fairy-gift-transformation",
    connectionTitle: "贈り物がしるしへ変わる",
    connectionSummary:
      "渡されたものや証拠が別の形で意味を持つ構造を、Guadalupe と妖精譚で比較する。",
    adoptionStatus: "adopt",
    relationBasis: "vallee_explicit",
    cautionLevel: "medium",
    displayMode: "education",
    connectionShape: "pair",
    sharedMotifs: ["贈り物", "しるし", "変換", "異界"],
    uiPoint: "贈り物変換という目で追いやすいモチーフをハイライトできる。",
    skepticNote: "信仰上の奇跡を民間伝承へ還元せず、物語構造のみを比較する。",
    faithContextNote,
    needsVerification: false,
  },
  {
    id: "agobard-airship",
    fromCardId: "agobard-magonia",
    toCardId: "airship-1897",
    connectionTitle: "雲の船と近代空中船",
    connectionSummary:
      "空から来る船や乗り物の語りが、中世伝承と近代の空中船報道で反復する。",
    adoptionStatus: "adopt",
    relationBasis: "vallee_explicit",
    cautionLevel: "low",
    displayMode: "education",
    connectionShape: "pair",
    sharedMotifs: ["雲", "空飛ぶ船", "空から来る乗り物", "群衆目撃"],
    uiPoint: "Magonia という名前の由来と1897年ウェーブを直感的につなげられる。",
    skepticNote: "時代も媒体も異なるため、連続性ではなく反復モチーフとして扱う。",
    needsVerification: false,
  },
  {
    id: "merkel-cloera-anchor",
    fromCardId: "merkel-anchor",
    toCardId: "cloera-gravesend-anchor",
    connectionTitle: "空の船から降りるアンカー",
    connectionSummary:
      "空中の船からアンカーが降り、地上と一時的に接触する伝承類型を比較する。",
    adoptionStatus: "adopt",
    relationBasis: "vallee_explicit",
    cautionLevel: "low",
    displayMode: "education",
    connectionShape: "pair",
    sharedMotifs: ["空飛ぶ船", "アンカー", "接触不能の実体", "群衆目撃"],
    uiPoint: "アンカーという具体物があるため、カードUIで記憶に残りやすい。",
    skepticNote: "地域伝承の混同を避けるため、出典ごとの異同を後続で確認する。",
    needsVerification: false,
  },
  {
    id: "airship-trickster-visitor",
    fromCardId: "airship-1897",
    toCardId: "joe-simonton",
    connectionTitle: "修理中の訪問者と不条理な接触",
    connectionSummary:
      "水や修理を求める訪問者、不自然な会話、生活感のある接触を奇妙な訪問者モチーフとして束ねる。",
    adoptionStatus: "adopt",
    relationBasis: "vallee_related",
    cautionLevel: "medium",
    displayMode: "exploration",
    connectionShape: "motif_group",
    sharedMotifs: ["奇妙な訪問者", "不条理な行動", "水の要求", "修理"],
    uiPoint: "1897年空中船を起点に、奇妙だが生活的な訪問者モチーフを見せられる。",
    skepticNote: "この接続は、訪問者のふるまいが奇妙に見える探索候補として扱う。",
    needsVerification: false,
  },
  {
    id: "masse-dewilde",
    fromCardId: "maurice-masse",
    toCardId: "marius-dewilde",
    connectionTitle: "フランス近接遭遇の反復パターン",
    connectionSummary:
      "小柄な存在、光、痕跡、局所的な物理異常を含むフランスの近接遭遇事例を比較する。",
    adoptionStatus: "adopt",
    relationBasis: "needs_source_check",
    cautionLevel: "medium",
    displayMode: "exploration",
    connectionShape: "pair",
    sharedMotifs: ["小柄な存在", "発光現象", "痕跡", "局所的な物理異常"],
    uiPoint: "UFO側カード同士で、モチーフの重なりがひと目でわかる。",
    skepticNote: "二次資料で流通する要約の差があるため、原典確認が必要。",
    needsVerification: true,
  },
  {
    id: "masse-socorro",
    fromCardId: "maurice-masse",
    toCardId: "socorro-zamora",
    connectionTitle: "着陸痕と小柄な存在",
    connectionSummary:
      "着陸痕、小柄な存在、物理的痕跡の組み合わせを、欧州と米国の事例で比較する。",
    adoptionStatus: "adopt",
    relationBasis: "editorial_candidate",
    cautionLevel: "medium",
    displayMode: "exploration",
    connectionShape: "cluster",
    sharedMotifs: ["小柄な存在", "着陸", "痕跡", "発光現象"],
    uiPoint: "Masse を起点に、近接遭遇カードを複数出せる。",
    skepticNote: "この接続は、着陸痕と小柄な存在の重なりを見る探索候補として扱う。",
    needsVerification: true,
  },
  {
    id: "georgian-water-simonton-airship",
    fromCardId: "georgian-bay-water",
    toCardId: "airship-1897",
    connectionTitle: "水と補給のモチーフ群",
    connectionSummary:
      "水や補給をめぐる行動を、空中船ウェーブや Simonton の接触譚と同じモチーフ群として扱う。",
    adoptionStatus: "adopt",
    relationBasis: "editorial_candidate",
    cautionLevel: "medium",
    displayMode: "exploration",
    connectionShape: "motif_group",
    sharedMotifs: ["水の要求", "補給", "空から来る乗り物", "不条理な行動"],
    uiPoint: "水という日常的モチーフで複数カードを束ねられる。",
    skepticNote: "ジョージアン湾側の出典精査が必要で、初期表示では探索候補として扱う。",
    needsVerification: true,
  },
  {
    id: "raveo-masse-dewilde",
    fromCardId: "raveo-dwarfs",
    toCardId: "maurice-masse",
    connectionTitle: "小柄な存在のUFO側クラスター",
    connectionSummary:
      "小柄な存在を中心に、ラヴェオ、マス、デヴィルドの近接遭遇候補を束ねる。",
    adoptionStatus: "adopt",
    relationBasis: "editorial_candidate",
    cautionLevel: "medium",
    displayMode: "exploration",
    connectionShape: "cluster",
    sharedMotifs: ["小柄な存在", "近接遭遇", "痕跡"],
    uiPoint: "小柄な存在という強い視覚モチーフで、UFO側の関連カードを増やせる。",
    skepticNote: "ラヴェオは要原本確認のため、v0では探索候補ラベル付きにする。",
    needsVerification: true,
  },
];
