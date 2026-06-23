export type CnUfoTimelineCategory =
  | "world-context"
  | "media"
  | "organization"
  | "magazine"
  | "sighting"
  | "case"
  | "conference"
  | "qigong-context"
  | "internet"
  | "film";

export type CnUfoTimelinePrecision = "day" | "month" | "year" | "approx" | "conflicted";
export type CnUfoTimelineConfidence = "high" | "medium" | "low";
export type CnUfoSourceStatus = "verified" | "secondary-only" | "needs-primary" | "conflicted";
export type CnUfoSourceType = "primary" | "secondary" | "reference" | "news" | "archive";

export type CnUfoTimelineDate = {
  start: string;
  end?: string;
  precision: CnUfoTimelinePrecision;
  display: string;
  dateCandidates?: string[];
};

export type CnUfoTimelineSource = {
  label: string;
  url?: string;
  type: CnUfoSourceType;
  note?: string;
};

export type CnUfoTimelineVisual = {
  src: string;
  alt: string;
  visualType: "line-illustration";
};

export type CnUfoTimelineItem = {
  id: string;
  date: CnUfoTimelineDate;
  category: CnUfoTimelineCategory;
  title: string;
  body: string;
  confidence: CnUfoTimelineConfidence;
  sourceStatus: CnUfoSourceStatus;
  sources: CnUfoTimelineSource[];
  visual?: CnUfoTimelineVisual;
  note?: string;
};

export type CnUfoEraSection = {
  id: string;
  label: string;
  years: string;
  note: string;
  itemIds: string[];
};

const sources = {
  chineseUfoSociety: {
    label: "中国UFO研究会",
    url: "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9C%8BUFO%E7%A0%94%E7%A9%B6%E6%9C%83",
    type: "reference",
  },
  feitansuo: {
    label: "飞碟探索",
    url: "https://zh.wikipedia.org/wiki/%E9%A3%9E%E7%A2%9F%E6%8E%A2%E7%B4%A2",
    type: "reference",
  },
  chinaSightings: {
    label: "中国的幽浮目击",
    url: "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9C%8B%E7%9A%84%E5%B9%BD%E6%B5%AE%E7%9B%AE%E6%93%8A",
    type: "reference",
  },
  ufoSightingsChina: {
    label: "UFO sightings in China",
    url: "https://en.wikipedia.org/wiki/UFO_sightings_in_China",
    type: "reference",
  },
  guizhou: {
    label: "贵州空中快车事件",
    url: "https://zh.wikipedia.org/wiki/%E8%B4%B5%E5%B7%9E%E7%A9%BA%E4%B8%AD%E5%BF%AB%E8%BD%A6%E4%BA%8B%E4%BB%B6",
    type: "reference",
  },
  sunShili: {
    label: "孫式立",
    url: "https://zh.wikipedia.org/wiki/%E5%AD%AB%E5%BC%8F%E7%AB%8B",
    type: "reference",
  },
  journey: {
    label: "宇宙探索编辑部",
    url: "https://zh.wikipedia.org/wiki/%E5%AE%87%E5%AE%99%E6%8E%A2%E7%B4%A2%E7%BC%96%E8%BE%91%E9%83%A8",
    type: "reference",
  },
  arnold: {
    label: "Kenneth Arnold UFO sighting",
    url: "https://en.wikipedia.org/wiki/Kenneth_Arnold_UFO_sighting",
    type: "reference",
  },
} satisfies Record<string, CnUfoTimelineSource>;

function lineVisual(name: string, alt: string): CnUfoTimelineVisual {
  return {
    src: `/cnufohistory/visuals/${name}.png`,
    alt,
    visualType: "line-illustration",
  };
}

export const cnufoTimelineItems: CnUfoTimelineItem[] = [
  {
    id: "ctx-19470624-kenneth-arnold",
    date: { start: "1947-06-24", precision: "day", display: "1947年6月24日" },
    category: "world-context",
    title: "ケネス・アーノルド目撃報告",
    body:
      "アメリカでケネス・アーノルドが高速で飛ぶ複数の物体を見たと語り、その報道から「空飛ぶ円盤」という言葉が広まった。戦後のUFO文化はアメリカだけにとどまらず、翻訳、科学記事、雑誌文化を通じて世界へ広がっていく。中国でUFOが大きく語られるのは改革開放後だが、その前提にはこの国際的なUFOイメージの流通があった。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.arnold],
    visual: lineVisual(
      "kenneth-arnold",
      "山並みの上を飛ぶ複数の円盤状の線画",
    ),
    note: "中国外の出来事のため、背景枠として扱う。",
  },
  {
    id: "cn-ufo-19770727-huang-yanqiu",
    date: { start: "1977-07-27", end: "1977-09-28", precision: "approx", display: "1977年7月27日-9月28日" },
    category: "case",
    title: "黄延秋事件",
    body:
      "河北省邯郸周辺で、黄延秋という青年が短期間に複数回姿を消し、遠方の都市まで移動していたと語られた事件。のちにUFOや超常的な移動体験と結びつけて紹介され、中国の奇談・怪事件の文脈で繰り返し語られるようになった。改革開放の直前から直後にかけて、未知現象への関心がどのように民間の物語として膨らんでいったかを示す前史的な出来事でもある。",
    confidence: "low",
    sourceStatus: "secondary-only",
    sources: [sources.chinaSightings],
    visual: lineVisual(
      "huang-yanqiu",
      "地図上を曲線で移動する人物の足跡を示した線画",
    ),
    note: "改革開放前後の前史として候補追加。UFO事件としての位置づけは資料により揺れる。",
  },
  {
    id: "cn-ufo-19781113-renminribao-ufo",
    date: {
      start: "1978-11-13",
      precision: "conflicted",
      display: "1978年11月13日 / 11月30日",
      dateCandidates: ["1978-11-13", "1978-11-30"],
    },
    category: "media",
    title: "『人民日報』がUFOを紹介",
    body:
      "『人民日報』が「UFO——一个不解的世界之谜」を掲載し、UFOを「世界の謎」として紹介した。改革開放が始まる時期の公的メディアでUFOが取り上げられたことは、未知現象を科学読み物として受け取る入口になった。海外の話題だったUFOが、中国の読者に向けて知的好奇心の対象として提示された点で重要な起点になる。",
    confidence: "medium",
    sourceStatus: "conflicted",
    sources: [
      {
        ...sources.chineseUfoSociety,
        note: "二次資料として1978年11月30日説を掲載。",
      },
    ],
    visual: lineVisual(
      "renminribao-ufo",
      "新聞紙面と円盤図版を組み合わせた線画",
    ),
    note: "一次資料画像または人民日報デジタル版URLで確定が必要。",
  },
  {
    id: "cn-ufo-19790920-ufo-enthusiasts-liaison",
    date: { start: "1979-09-20", precision: "day", display: "1979年9月20日" },
    category: "organization",
    title: "中国UFO愛好者連絡処が武漢大学で発足",
    body:
      "武漢大学で「中国UFO愛好者連絡処」が成立した。各地の愛好者や研究者をつなぎ、目撃情報や海外文献を共有するための連絡拠点が生まれたことになる。個人の好奇心や読者投稿に近かったUFO関心が、組織的な研究活動へ向かい始めた瞬間だった。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.chineseUfoSociety],
    visual: lineVisual(
      "ufo-liaison",
      "会議机と複数の人物を線でつないだ研究会の線画",
    ),
  },
  {
    id: "cn-ufo-198005-ufo-research-association",
    date: { start: "1980-05", precision: "month", display: "1980年5月" },
    category: "organization",
    title: "中国UFO研究協会へ改称",
    body:
      "中国UFO愛好者連絡処は、武漢市科学技術協会の承認を受けて「中国UFO研究協会」へ改称した。愛好者の連絡組織から、より研究団体らしい名称と形へ移ったことで、観測、調査、資料収集を進める足場が強まった。地方の科学技術団体との関係を得たことも、初期UFO研究に一定の公共性を与えた。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.chineseUfoSociety],
  },
  {
    id: "cn-ufo-19810225-feitansuo-launch",
    date: { start: "1981-02-25", precision: "day", display: "1981年2月25日" },
    category: "magazine",
    title: "『飞碟探索』創刊",
    body:
      "原甘粛人民出版社系で、UFO・地外文明・未知現象を扱う雑誌『飞碟探索』が創刊した。海外UFO情報、読者投稿、宇宙科学、未知現象の記事が一冊の雑誌に集まり、研究会の外にいる読者にもUFO文化を広げた。1980年代から90年代にかけて、この雑誌は中国UFOブームの記憶を形づくる中心的な媒体になっていく。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.feitansuo],
    visual: lineVisual(
      "feitansuo-magazine",
      "UFO図版のある雑誌が重なった線画",
    ),
  },
  {
    id: "cn-ufo-198103-first-national-congress",
    date: { start: "1981-03", precision: "month", display: "1981年3月" },
    category: "organization",
    title: "中国UFO研究協会 第1回全国代表大会",
    body:
      "武漢大学で第1回全国代表大会が開かれ、初代理事会が組成された。UFO研究を個別の愛好活動ではなく、全国的な連絡網と代表組織を持つ活動として進める姿勢が示された。以後、各地の分会や研究者が同じ枠組みの中で情報を交換しやすくなった。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.chineseUfoSociety],
  },
  {
    id: "cn-ufo-19810724-spiral-luminous-object",
    date: { start: "1981-07-24", precision: "day", display: "1981年7月24日 22時40分ごろ" },
    category: "sighting",
    title: "「7・24」螺旋状発光体事件",
    body:
      "中国西部の広い範囲で、螺旋状に回転しながら移動する発光体が見えたと報告された。単発の個人目撃ではなく、複数地域にまたがる現象として語られたため、初期の中国UFO研究にとって大きな調査対象になった。中国UFO研究協会は各地分会を通じて情報を集め、この事件は長く代表的な目撃例として記憶された。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.chineseUfoSociety],
    visual: lineVisual(
      "spiral-luminous-object",
      "夜空に大きな螺旋を描く発光体と観測者の線画",
    ),
    note: "具体的な観測範囲や分析者は一次資料で追加確認する。",
  },
  {
    id: "cn-ufo-1983-second-congress-renaming",
    date: { start: "1983", precision: "year", display: "1983年" },
    category: "organization",
    title: "第2回全国代表大会で中国UFO研究会へ改称",
    body:
      "上海で第2回全国代表大会が開かれ、協会は「中国UFO研究会」へ改称したとされる。名称の変化は、UFOを単なる愛好や紹介ではなく、観測と研究の対象として扱おうとする意識を反映していた。会址も広州へ移り、武漢から始まった活動はより広い地域ネットワークへ広がっていった。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.chineseUfoSociety],
  },
  {
    id: "cn-ufo-1984-qian-xuesen-letter",
    date: { start: "1984", precision: "year", display: "1984年" },
    category: "qigong-context",
    title: "銭学森が『飞碟探索』に書簡",
    body:
      "中国宇宙開発の象徴的人物である銭学森が、『飞碟探索』にUFO研究に関する書簡を送ったと伝えられている。UFOを奇談として片づけるのではなく、社会に広がる観測報告や関心そのものを研究対象にできるという趣旨で受け止められた。著名科学者の名前が結びついたことで、UFO研究は大衆的な好奇心だけでなく、科学と社会の境界をめぐる話題としても語られるようになった。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    visual: lineVisual(
      "qian-letter",
      "手紙とロケット、円盤図版を組み合わせた線画",
    ),
    note: "掲載号・書簡原文・日付の一次確認が必要。",
  },
  {
    id: "cn-ufo-1984-dalian-ufo-society",
    date: { start: "1984", precision: "year", display: "1984年" },
    category: "organization",
    title: "大連市UFO研究学会が成立",
    body:
      "金帆らの活動を背景に、大連市UFO研究学会が成立したとされる。大連はのちに研究者会議や国際的なUFO大会の舞台となり、地方研究会が全国的なネットワークを支える拠点になっていく。中国UFO史では、北京や上海だけでなく、地方都市の民間研究者が継続的な活動を担ったことも見逃せない。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.sunShili],
    visual: lineVisual(
      "dalian-conference",
      "会議卓を囲む人物と円盤の記号を描いた線画",
    ),
  },
  {
    id: "cn-ufo-1985-dalian-ufo-seminar",
    date: { start: "1985", precision: "year", display: "1985年" },
    category: "conference",
    title: "大連で中国初期UFO研討会",
    body:
      "大連で中国初期のUFO研討会が開かれたとされる。研究会メンバーや関心を持つ人々が集まり、目撃事例、観測方法、海外情報について議論する場が生まれた。こうした集会の積み重ねが、のちの全国的な会議や国際交流へつながっていく。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.sunShili],
    visual: lineVisual(
      "dalian-conference",
      "会議卓を囲む人物と円盤の記号を描いた線画",
    ),
  },
  {
    id: "cn-ufo-1986-third-congress-beijing",
    date: { start: "1986", precision: "year", display: "1986年" },
    category: "organization",
    title: "第3回全国代表大会と北京移転",
    body:
      "長春で第3回全国代表大会が開かれ、孫式立が理事長に選ばれたとされる。会址は北京へ移り、中国科学技術協会との関係を意識した運営が進められた。1980年代半ばの中国UFO研究は、地方の熱気と中央組織への志向が重なりながら、全国的な活動として形を整えていった。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.chineseUfoSociety, sources.sunShili],
  },
  {
    id: "cn-ufo-1988-qigong-affiliation",
    date: { start: "1988-01", precision: "month", display: "1988年1月" },
    category: "qigong-context",
    title: "中国気功科学研究会との制度的接続",
    body:
      "中国UFO研究会は、中国気功科学研究会の二級学会として制度的な位置を得たとされる。これにより組織として活動しやすくなる一方、UFO研究は気功、人体特異功能、超常現象研究と近い場所に置かれることになった。1980年代後半の中国では、科学、身体、未知能力、宇宙への想像力が同じ時代の熱気の中で語られていた。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    note: "団体資料または当時の会報で確認が必要。",
  },
  {
    id: "cn-ufo-19900623-kaifeng-fragment",
    date: { start: "1990-06-23", precision: "day", display: "1990年6月23日" },
    category: "case",
    title: "開封UFO残片事件",
    body:
      "開封および周辺で火球状の物体が目撃され、翌日以降に破片が見つかったという話が広がった。空から落ちてきた物体、金属片、目撃談が結びつくことで、UFO事件らしい輪郭を持つニュースとして語られた。1990年代に入ると、中国のUFO関心は研究会や雑誌だけでなく、地方発の事件談としても人々の記憶に残っていく。",
    confidence: "low",
    sourceStatus: "secondary-only",
    sources: [sources.chinaSightings],
    visual: lineVisual(
      "kaifeng-fragment",
      "不規則な破片を虫眼鏡で調べる線画",
    ),
    note: "事件詳細は番組・地方報道依存が強く、一次資料確認が必要。",
  },
  {
    id: "cn-ufo-1992-fourth-congress",
    date: { start: "1992", precision: "year", display: "1992年" },
    category: "organization",
    title: "第4回全国代表大会",
    body:
      "北京で中国UFO研究会の第4回全国代表大会が開かれた。気功や超常現象をめぐる議論が社会に広がるなか、UFO研究会も科学的な態度や研究方法を改めて意識する必要に迫られた。研究対象が魅力的であるほど、疑似科学と見なされることへの緊張も強まっていった。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.chineseUfoSociety],
  },
  {
    id: "cn-ufo-199307-falun-gong-qigong-association",
    date: { start: "1993-07", precision: "month", display: "1993年7月" },
    category: "qigong-context",
    title: "法輪功が気功科学研究会に参加",
    body:
      "法輪功が中国気功科学研究会に入ったとされる。UFO研究会と法輪功は同一組織ではないが、どちらも気功や超常現象をめぐる制度的空間と接点を持っていた。1990年代の中国では、身体能力、霊性、科学、未知現象への関心が複雑に重なり、その後の政治的緊張へつながる土壌ができていった。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    note: "UFO史本体ではなく周辺思想史。採用時は背景枠として明示する。",
  },
  {
    id: "cn-ufo-199405-phoenix-mountain-rumors",
    date: { start: "1994-05", precision: "month", display: "1994年5月末" },
    category: "case",
    title: "鳳凰山で不明物体目撃が始まる",
    body:
      "黒竜江省五常市の鳳凰山周辺で、山中に不明物体があるという噂や目撃談が出たとされる。自然豊かな山地、未確認の物体、現地の人々の証言が重なり、物語は急速に事件化していった。これが後に孟照国事件として知られる一連の接近遭遇談の入口になる。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.ufoSightingsChina],
    visual: lineVisual(
      "phoenix-mountain",
      "山並みの上に浮かぶ発光体を描いた線画",
    ),
  },
  {
    id: "cn-ufo-19940606-meng-zhaoguo",
    date: { start: "1994-06-06", precision: "day", display: "1994年6月6日" },
    category: "case",
    title: "孟照国が鳳凰山の物体を接近観察したと主張",
    body:
      "孟照国が親族とともに鳳凰山の不明物体へ接近したとされる。山中での目撃はやがて異星人との遭遇や身体的体験を含む物語へ広がり、中国で最もよく知られたUFO接近遭遇談の一つになった。事件は雑誌、テレビ、ネット記事で繰り返し紹介され、1990年代中国UFOブームを象徴する物語として定着していく。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.ufoSightingsChina],
    visual: lineVisual(
      "phoenix-mountain",
      "山並みの上に浮かぶ発光体を描いた線画",
    ),
  },
  {
    id: "cn-ufo-19941201-guizhou-airborne-train",
    date: { start: "1994-12-01", precision: "day", display: "1994年12月1日 未明" },
    category: "case",
    title: "貴州「空中怪車」事件",
    body:
      "貴州省貴陽市白雲区の都溪林場で、強い音と光を伴う奇妙な出来事が起き、森林被害や施設被害が報告された。目撃談だけでなく、現場に残った被害の印象が強かったため、この事件は大きな注目を集めた。鳳凰山事件と並び、1990年代中国UFOブームの代表的な事件として語られている。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.guizhou],
    visual: lineVisual(
      "guizhou-forest",
      "林場の木々と倒木、上空の発光体を描いた線画",
    ),
  },
  {
    id: "cn-ufo-1995-reports-5000",
    date: { start: "1995", precision: "year", display: "1995年までの約10年間" },
    category: "media",
    title: "中国国内UFO報告が約5,000件に達したと報じられる",
    body:
      "1995年までの約10年間で、中国国内のUFO報告が約5,000件に達したと紹介された。数字の大きさは、UFOが一部の研究者だけの関心ではなく、各地の読者、目撃者、地方メディアを巻き込む話題になっていたことを示している。1990年代の中国では、未知現象を語る熱気が雑誌文化や民間研究会を通じて広く流通していた。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    visual: lineVisual(
      "reports-5000",
      "多数の報告書と点の集まりを描いた線画",
    ),
    note: "South China Morning Post系の集計として要出典確認。",
  },
  {
    id: "cn-ufo-1996-feitansuo-peak",
    date: { start: "1996", precision: "year", display: "1996年" },
    category: "magazine",
    title: "『飞碟探索』発行部数がピークへ",
    body:
      "『飞碟探索』は1990年代に最盛期を迎え、発行部数が最高で34万部規模に達したとされる。UFO、宇宙人、未知現象、科学読み物が一冊の雑誌に集まり、読者はそこから世界の謎へアクセスした。研究会の内部資料ではなく、書店や読者投稿を通じて広がる大衆的な読書文化としてUFOが定着していた。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [sources.feitansuo],
    visual: lineVisual(
      "feitansuo-magazine",
      "UFO図版のある雑誌が重なった線画",
    ),
    note: "発行部数34万部の直接出典確認が必要。",
  },
  {
    id: "cn-ufo-199603-falun-gong-leaves",
    date: { start: "1996-03", precision: "month", display: "1996年3月" },
    category: "qigong-context",
    title: "法輪功が気功科学研究会から離脱／排除",
    body:
      "資料により表現は異なるが、法輪功が中国気功科学研究会から離れたとされる。気功・超常現象系の団体をめぐる空気は次第に厳しくなり、疑似科学批判や組織管理への関心が強まっていった。UFO研究会もその周辺に位置していたため、組織運営や社会的な見られ方に影響を受けることになる。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    note: "UFO史本体ではなく周辺思想史。採用時は背景枠として明示する。",
  },
  {
    id: "cn-ufo-199709-curo-dissolution",
    date: { start: "1997-09", precision: "month", display: "1997年9月" },
    category: "organization",
    title: "中国UFO研究会が解散",
    body:
      "中国UFO研究会が解散した。1980年代から続いた全国組織としての枠組みはいったん途切れ、各地の支部や研究者は独立的に活動を続けることになった。ここから中国UFO研究は、公式な全国組織よりも地方研究会、個人ネットワーク、香港登録団体などを通じて再編されていく。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.chineseUfoSociety],
    visual: lineVisual(
      "curo-dissolution",
      "結び目が切れた研究ネットワークを描いた線画",
    ),
  },
  {
    id: "cn-ufo-199809-dalian-researcher-meeting",
    date: { start: "1998-09", precision: "month", display: "1998年9月" },
    category: "conference",
    title: "大連でUFO研究者会議",
    body:
      "大連支部が中心となり、全国のUFO研究者が集まる会議を開催したとされる。中国UFO研究会の解散後も、研究者たちは調査、会報、観測、国際交流を続ける道を探していた。大連はその後も華人UFO研究ネットワークの重要な結節点として浮上していく。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    note: "会議名称・参加者・日付の確認が必要。",
  },
  {
    id: "cn-ufo-199904-world-chinese-ufo-hongkong",
    date: { start: "1999-04", precision: "month", display: "1999年4月" },
    category: "organization",
    title: "世界華人UFO連合会が香港で登録",
    body:
      "大連会議を受け、「世界華人UFO連合会」が香港で登録されたとされる。中国本土の制度的な制約を避けながら、華人圏の研究者や愛好者をつなぐネットワークを作ろうとする動きだった。UFO研究は国内組織の解散後も、場所と名義を変えながら継続の道を探していた。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.sunShili],
    note: "孫式立の就任時期は1999年11月とする資料もあるため、組織登録月は追加確認が必要。",
  },
  {
    id: "cn-ufo-199910-chinese-characteristics",
    date: { start: "1999-10", precision: "month", display: "1999年10月" },
    category: "media",
    title: "「UFO研究必须具有中国特色」論文",
    body:
      "劉東軍による「UFO研究必须具有中国特色」が『科学中国人』に掲載されたとされる。そこではUFO研究を、専門家と大衆の協力、全国的な観測網、唯物論的な研究態度と結びつけて考えようとしていた。組織が揺らぐ時期に、UFO研究を中国社会の中でどう正当化し、どう続けるかをめぐる言葉が模索されていた。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    note: "掲載誌・号・本文確認が必要。",
  },
  {
    id: "cn-ufo-2002-dalian-world-chinese-seminar",
    date: { start: "2002", precision: "year", display: "2002年" },
    category: "conference",
    title: "大連で世界華人UFO科学研討会",
    body:
      "大連で世界華人UFO科学研討会が開かれたとされる。国内の研究者だけでなく、華人圏や海外の関係者を意識した会議名が使われ、UFO研究は国境を越える交流の場として再構成されていった。1997年以後の断絶は、別の形のネットワークづくりへ向かうきっかけにもなった。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.sunShili],
    visual: lineVisual(
      "dalian-conference",
      "会議卓を囲む人物と円盤の記号を描いた線画",
    ),
  },
  {
    id: "cn-ufo-2003-meng-polygraph",
    date: { start: "2003", precision: "year", display: "2003年" },
    category: "case",
    title: "孟照国がポリグラフ検査を受けたと報じられる",
    body:
      "鳳凰山事件の当事者・孟照国が嘘発見器検査を受けたと紹介された。1994年の出来事は一過性の地方事件で終わらず、当事者の証言、検査、再取材を通じて何度も語り直された。中国UFO文化の中で、孟照国事件は事件そのものだけでなく、その後も検証され続ける物語として存在感を持った。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.ufoSightingsChina],
  },
  {
    id: "cn-ufo-20050908-dalian-world-ufo-conference",
    date: { start: "2005-09-08", precision: "day", display: "2005年9月8日" },
    category: "conference",
    title: "大連で世界UFO大会が開幕",
    body:
      "大連で世界UFO大会が開かれ、中国で開かれる世界UFO大会として報道された。地方研究会の活動が、国際会議という形式で外へ開かれた出来事だった。大連は1980年代からの研究会活動を背景に、2000年代の中国UFO交流を象徴する都市になっていく。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.sunShili],
  },
  {
    id: "cn-ufo-2005-phoenix-mountain-pilgrimage",
    date: { start: "2005", precision: "year", display: "2005年" },
    category: "case",
    title: "鳳凰山がUFO巡礼地化",
    body:
      "鳳凰山は孟照国事件以後、UFO愛好家が訪れる場所として語られるようになった。山そのものが事件の記憶を帯び、目撃談や撮影例、観光的な関心と結びついていく。UFO事件は記事や証言だけでなく、実際に訪れることのできる場所のイメージとしても残った。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    visual: lineVisual(
      "phoenix-mountain",
      "山並みの上に浮かぶ発光体を描いた線画",
    ),
    note: "観光化・撮影例の個別報道確認が必要。",
  },
  {
    id: "cn-ufo-2009-pulandian-observation-station",
    date: { start: "2009", precision: "year", display: "2009年" },
    category: "organization",
    title: "普蘭店に民間UFO観測站",
    body:
      "金帆らが普蘭店市小張屯に民間UFO観測站を設けたとされる。雑誌や会議だけでなく、空を観測し記録する実践を続けようとする動きがあった。2000年代以降も、地方研究者たちは自分たちの方法でUFO研究の場を維持しようとしていた。",
    confidence: "medium",
    sourceStatus: "secondary-only",
    sources: [sources.sunShili],
    visual: lineVisual(
      "pulandian-observation",
      "小屋と望遠鏡で空を観測する線画",
    ),
  },
  {
    id: "cn-ufo-20100707-xiaoshan-airport",
    date: { start: "2010-07-07", precision: "day", display: "2010年7月7日 20時ごろ" },
    category: "case",
    title: "杭州・蕭山空港UFO事件",
    body:
      "杭州蕭山国際空港の上空に不明飛行物体が出たとして、空港運用に影響が出た。航空交通と結びついたことで、事件は通常の目撃談よりも大きなニュースになり、写真や解説がネット上で急速に広がった。後には写真の出所や航空機の可能性をめぐる検証も行われ、ネット時代のUFO事件らしい展開を見せた。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.ufoSightingsChina],
    visual: lineVisual(
      "xiaoshan-airport",
      "滑走路の幾何学的な線と上空の小さな発光体を描いた線画",
    ),
  },
  {
    id: "cn-ufo-20110820-network-sighting-wave",
    date: { start: "2011-08-20", precision: "day", display: "2011年8月20日 夜" },
    category: "internet",
    title: "微博時代の同時多発的な目撃波",
    body:
      "北京、上海、内モンゴル、山西などで巨大な光球や光環のようなものが目撃されたとして、微博などで情報が拡散した。紙の雑誌に投稿が集まる時代とは違い、目撃談は写真、短文、転載を通じてほぼリアルタイムに共有されるようになった。UFO文化は研究会や雑誌の手を離れ、ネット上の集合的な話題として広がっていく。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    visual: lineVisual(
      "network-wave",
      "複数のスマートフォン画面と空の光を線でつないだ線画",
    ),
    note: "個別報道・投稿・航空/宇宙活動との照合が必要。",
  },
  {
    id: "cn-ufo-20110830-guangzhou-cencun-video",
    date: { start: "2011-08-30", precision: "day", display: "2011年8月30日 17時ごろ" },
    category: "internet",
    title: "広州岑村UFO動画が拡散",
    body:
      "広州で巨大な飛行物体を撮影したとする動画がネットで拡散した。映像は強いインパクトを持っていたが、同時に周辺証言や映像上の不自然点を検証する動きも起きた。ネット時代のUFO文化では、驚きの映像が広がる速さと、それを疑い、分析し、加工の可能性を指摘する速さが同居していた。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    visual: lineVisual(
      "cencun-video",
      "動画再生画面の中に大きな飛行物体を描いた線画",
    ),
    note: "動画元・検証記事・削除/再投稿履歴の確認が必要。",
  },
  {
    id: "cn-ufo-20110926-northwest-luminous-object",
    date: { start: "2011-09-26", precision: "day", display: "2011年9月26日 19時22分-32分" },
    category: "internet",
    title: "中国北部・西北部で発光体目撃",
    body:
      "内モンゴル、寧夏、陝西、山西、甘粛、河北などで奇妙な発光体が目撃されたと報じられた。広域の空に現れた光は、微博やニュースサイトを通じて一つの話題へまとまっていった。2011年前後の中国では、終末論、宇宙ブーム、ネット動画文化が重なり、空の異変がすぐにUFO騒動として語られる環境があった。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    note: "宇宙・軍事・ミサイル関連の可能性も含め、別途検証が必要。",
  },
  {
    id: "cn-ufo-201812-feitansuo-last-before-hiatus",
    date: { start: "2018-12", precision: "month", display: "2018年12月" },
    category: "magazine",
    title: "『飞碟探索』休刊前の最後の号",
    body:
      "長く中国UFO文化を支えた『飞碟探索』は、2018年12月号を最後に休刊へ向かった。かつて読者投稿や海外UFO情報を集めた紙の雑誌は、ネットメディアの時代に読者との関係を変えざるを得なくなっていた。1980年代から続いたUFO雑誌文化の一区切りとして、この号は象徴的な意味を持つ。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.feitansuo],
    visual: lineVisual(
      "feitansuo-hiatus-relaunch",
      "閉じた雑誌と再起動する誌面を並べた線画",
    ),
  },
  {
    id: "cn-ufo-2019-feitansuo-hiatus",
    date: { start: "2019", precision: "year", display: "2019年" },
    category: "magazine",
    title: "『飞碟探索』休刊",
    body:
      "『飞碟探索』が2019年から休刊した。1980年代から90年代にかけて、UFOや未知現象への入口だった雑誌が姿を消したことで、紙媒体を中心とするブームの時代は明確に過去のものになった。UFO文化は雑誌の読者共同体から、ネット上の検索、動画、ノスタルジーへ重心を移していく。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.feitansuo],
    visual: lineVisual(
      "feitansuo-hiatus-relaunch",
      "閉じた雑誌と再起動する誌面を並べた線画",
    ),
  },
  {
    id: "cn-ufo-20200605-feitansuo-cloud-relaunch",
    date: { start: "2020-06-05", precision: "day", display: "2020年6月5日" },
    category: "magazine",
    title: "『飞碟探索』がクラウド復刊",
    body:
      "『飞碟探索』が復刊した。ただし、かつてのようにUFOや宇宙人を中心に据える雑誌ではなく、より広い科学普及誌として再出発したとされる。名前は戻ってきても、読者環境も科学コミュニケーションのあり方も大きく変わっていた。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.feitansuo],
    visual: lineVisual(
      "feitansuo-hiatus-relaunch",
      "閉じた雑誌と再起動する誌面を並べた線画",
    ),
  },
  {
    id: "cn-ufo-20211017-journey-film-festival",
    date: { start: "2021-10-17", precision: "day", display: "2021年10月17日" },
    category: "film",
    title: "『宇宙探索編集部』が平遥国際映画展で初上映",
    body:
      "『宇宙探索編集部』が平遥国際映画展で初上映された。映画はUFO雑誌の編集部、地方調査、宇宙への執着をユーモラスかつ哀愁のある物語として描いた。かつてリアルタイムの熱狂だったUFO雑誌文化は、ここで映画的な記憶とノスタルジーの対象へ変わっていく。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.journey],
    visual: lineVisual(
      "journey-editorial-office",
      "編集机と望遠鏡、旅の荷物を組み合わせた線画",
    ),
  },
  {
    id: "cn-ufo-20230401-journey-china-release",
    date: { start: "2023-04-01", precision: "day", display: "2023年4月1日" },
    category: "film",
    title: "『宇宙探索編集部』が中国本土で劇場公開",
    body:
      "『宇宙探索編集部』が中国本土で劇場公開された。UFOを追う人々の不器用さ、雑誌編集部の古びた空気、地方を歩く調査の感覚が、多くの観客に1980-90年代的な文化の記憶を呼び起こした。UFOブームはもはや新しい社会現象ではなく、過去を振り返るカルチャーとして再発見されていく。",
    confidence: "high",
    sourceStatus: "secondary-only",
    sources: [sources.journey],
    visual: lineVisual(
      "journey-editorial-office",
      "編集机と望遠鏡、旅の荷物を組み合わせた線画",
    ),
  },
  {
    id: "cn-ufo-20230424-xinhua-feitansuo-journey",
    date: { start: "2023-04-24", precision: "day", display: "2023年4月24日" },
    category: "film",
    title: "新華社が『飞碟探索』と映画を関連づけて報道",
    body:
      "新華社が、映画『宇宙探索編集部』の話題化にあわせ、その原型的存在として『飞碟探索』を紹介したとされる。かつてのUFO雑誌は、単なる珍しい雑誌ではなく、中国の大衆科学、地方調査、未知への憧れを思い出させる文化的な記号になっていた。映画をきっかけに、UFO雑誌文化は現代カルチャーの記憶として再び語られた。",
    confidence: "low",
    sourceStatus: "needs-primary",
    sources: [],
    visual: lineVisual(
      "journey-editorial-office",
      "編集机と望遠鏡、旅の荷物を組み合わせた線画",
    ),
    note: "新華社記事URLまたは転載確認が必要。",
  },
  {
    id: "ctx-20231013-journey-japan-release",
    date: { start: "2023-10-13", precision: "day", display: "2023年10月13日" },
    category: "film",
    title: "『宇宙探索編集部』が日本公開",
    body:
      "中国UFO雑誌文化を下敷きにした映画が日本でも公開された。中国の地方調査、UFO雑誌、宇宙への執着を描いた物語は、日本の観客にもサブカルチャー映画として受け取られた。中国UFO文化は国内のブーム史にとどまらず、海外で中国映画を読む手がかりとしても届くようになった。",
    confidence: "medium",
    sourceStatus: "needs-primary",
    sources: [],
    visual: lineVisual(
      "journey-editorial-office",
      "編集机と望遠鏡、旅の荷物を組み合わせた線画",
    ),
    note: "中国外の出来事のため背景枠として扱う。日本配給資料で確認が必要。",
  },
];

export const cnufoEraSections: CnUfoEraSection[] = [
  {
    id: "prehistory",
    label: "前史・導入期",
    years: "1947-1978",
    note: "戦後UFO文化、改革開放後の科学熱、公的メディアによる紹介が中国UFO史の入口を作る。",
    itemIds: [
      "ctx-19470624-kenneth-arnold",
      "cn-ufo-19770727-huang-yanqiu",
      "cn-ufo-19781113-renminribao-ufo",
    ],
  },
  {
    id: "formation",
    label: "中国ユーフォロジーの成立",
    years: "1979-1988",
    note: "民間研究組織、全国大会、雑誌文化が整い、中国UFO研究は組織化されていく。",
    itemIds: [
      "cn-ufo-19790920-ufo-enthusiasts-liaison",
      "cn-ufo-198005-ufo-research-association",
      "cn-ufo-19810225-feitansuo-launch",
      "cn-ufo-198103-first-national-congress",
      "cn-ufo-19810724-spiral-luminous-object",
      "cn-ufo-1983-second-congress-renaming",
      "cn-ufo-1984-qian-xuesen-letter",
      "cn-ufo-1984-dalian-ufo-society",
      "cn-ufo-1985-dalian-ufo-seminar",
      "cn-ufo-1986-third-congress-beijing",
      "cn-ufo-1988-qigong-affiliation",
    ],
  },
  {
    id: "qigong-and-1990s",
    label: "気功ブームと1990年代事件",
    years: "1990-1997",
    note: "気功・超常現象研究との接続、著名事件、雑誌文化のピークが重なる。",
    itemIds: [
      "cn-ufo-19900623-kaifeng-fragment",
      "cn-ufo-1992-fourth-congress",
      "cn-ufo-199307-falun-gong-qigong-association",
      "cn-ufo-199405-phoenix-mountain-rumors",
      "cn-ufo-19940606-meng-zhaoguo",
      "cn-ufo-19941201-guizhou-airborne-train",
      "cn-ufo-1995-reports-5000",
      "cn-ufo-1996-feitansuo-peak",
      "cn-ufo-199603-falun-gong-leaves",
      "cn-ufo-199709-curo-dissolution",
    ],
  },
  {
    id: "reorganization",
    label: "組織の断絶と再編",
    years: "1998-2009",
    note: "中国UFO研究会解散後、地方研究会・香港登録・国際会議を通じてネットワークが再編される。",
    itemIds: [
      "cn-ufo-199809-dalian-researcher-meeting",
      "cn-ufo-199904-world-chinese-ufo-hongkong",
      "cn-ufo-199910-chinese-characteristics",
      "cn-ufo-2002-dalian-world-chinese-seminar",
      "cn-ufo-2003-meng-polygraph",
      "cn-ufo-20050908-dalian-world-ufo-conference",
      "cn-ufo-2005-phoenix-mountain-pilgrimage",
      "cn-ufo-2009-pulandian-observation-station",
    ],
  },
  {
    id: "internet",
    label: "空港事件・ネット動画・フェイク検証",
    years: "2010-2011",
    note: "空港運用への影響、微博での拡散、動画検証がネット時代のUFO文化を形づくる。",
    itemIds: [
      "cn-ufo-20100707-xiaoshan-airport",
      "cn-ufo-20110820-network-sighting-wave",
      "cn-ufo-20110830-guangzhou-cencun-video",
      "cn-ufo-20110926-northwest-luminous-object",
    ],
  },
  {
    id: "nostalgia",
    label: "雑誌文化の終わりとノスタルジー化",
    years: "2018-2023",
    note: "紙のUFO雑誌文化は休刊・復刊を経て、映画や海外受容の中で記憶として再編集される。",
    itemIds: [
      "cn-ufo-201812-feitansuo-last-before-hiatus",
      "cn-ufo-2019-feitansuo-hiatus",
      "cn-ufo-20200605-feitansuo-cloud-relaunch",
      "cn-ufo-20211017-journey-film-festival",
      "cn-ufo-20230401-journey-china-release",
      "cn-ufo-20230424-xinhua-feitansuo-journey",
      "ctx-20231013-journey-japan-release",
    ],
  },
];

export function getCnufoTimelineItemMap() {
  return new Map(cnufoTimelineItems.map((item) => [item.id, item]));
}
