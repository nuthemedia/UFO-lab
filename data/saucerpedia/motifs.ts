import type { SaucerpediaSource } from "./types";

export type SaucerpediaMotif = {
  id: string;
  name: string;
  englishName: string;
  category:
    | "目撃のはじまり"
    | "接近・着陸"
    | "搭乗者・存在との遭遇"
    | "コンタクト体験"
    | "アブダクション体験"
    | "心理・時間感覚の異常"
    | "周辺怪異・ハイストレンジネス";
  summary: string;
  experienceContext: string;
  relatedEvents?: string[];
  relatedPeople?: string[];
  relatedTerms: string[];
  sources?: SaucerpediaSource[];
};

export const motifCategories = [
  "目撃のはじまり",
  "接近・着陸",
  "搭乗者・存在との遭遇",
  "コンタクト体験",
  "アブダクション体験",
  "心理・時間感覚の異常",
  "周辺怪異・ハイストレンジネス",
];

export const saucerpediaMotifs: SaucerpediaMotif[] = [
  {
    id: "anomalous-light",
    name: "異常な光",
    englishName: "Anomalous Light",
    category: "目撃のはじまり",
    summary: "夜空や遠方に現れる、通常の星や航空機と違って見える光。",
    experienceContext:
      "UFO体験談の入口としてもっとも多いモチーフです。星や航空機の灯火に比べて異常に明るい、赤や緑などの強い色がついている、点滅のパターンが不規則、急に現れたり消えたりするといった特徴が「普通の光ではない」という印象を生み、UFO報告につながります。",
    relatedEvents: ["ワシントンD.C. UFO事件", "フェニックス・ライト"],
    relatedTerms: ["UFO", "UAP", "誤認", "IFO"],
  },
  {
    id: "stationary-light",
    name: "静止する光",
    englishName: "Stationary Light",
    category: "目撃のはじまり",
    summary: "空中に長く止まっているように見える光。低空UFOとして語られやすい。",
    experienceContext:
      "遠方の航空機、金星、ドローンなどでも起きる見え方ですが、目撃時には空中で静止する未知の物体として印象に残ります。",
    relatedEvents: ["フェニックス・ライト"],
    relatedTerms: ["金星", "飛行機", "ドローン", "誤認"],
  },
  {
    id: "silent-flight",
    name: "無音飛行",
    englishName: "Silent Flight",
    category: "目撃のはじまり",
    summary: "大きな物体や光が、音を立てずに移動したとされる目撃表現。",
    experienceContext:
      "巨大な三角形や低空の光体が無音で移動したという報告でよく現れます。実際には対象との距離が遠いために音が届きにくい、風向きや周囲の騒音で音がかき消されている、あるいは航空機の高度や種類によってエンジン音が想像より小さいといった要因が、無音という印象につながっていることがあります。",
    relatedEvents: ["ベルギーUFOウェーブ", "フェニックス・ライト"],
    relatedTerms: ["UFOウェーブ", "三角形UFO", "検証"],
  },
  {
    id: "rapid-acceleration",
    name: "急加速",
    englishName: "Rapid Acceleration",
    category: "目撃のはじまり",
    summary: "光や物体が突然高速で移動したとされる、UFOらしい動きの代表表現。",
    experienceContext:
      "目撃者の視界から急に離れた、映像内で高速に横切った、センサー上で急速に移動したとされる場面で使われます。",
    relatedEvents: ["Tic Tac事件", "Gimbal", "GoFast"],
    relatedTerms: ["UAP", "パララックス", "検証"],
  },
  {
    id: "right-angle-turn",
    name: "直角ターン",
    englishName: "Right-angle Turn",
    category: "目撃のはじまり",
    summary: "通常の航空機では難しい角度で進路を変えたとされる動き。",
    experienceContext:
      "古典的なUFO目撃談で、知的制御や未知の推進を連想させるモチーフです。実際には、対象が遠方にあるほど方向転換が一瞬に見えやすく、観察者の視線移動や記憶の編集によって滑らかな旋回が直角に近い動きとして語られることもあり、距離や速度の判断が難しい状況がこの印象を生みます。",
    relatedTerms: ["UFO", "UAP", "検証", "地球外仮説 / ETH"],
  },
  {
    id: "disappearance",
    name: "消失",
    englishName: "Disappearance",
    category: "目撃のはじまり",
    summary: "光や物体が突然見えなくなる体験。瞬間移動や消滅として語られることがある。",
    experienceContext:
      "雲、地平線、建物、地球の影、露出やピントの変化でも起きますが、体験談では物体が急に消えた印象として残ります。",
    relatedTerms: ["人工衛星", "レンズフレア", "誤認", "検証"],
  },
  {
    id: "landing-trace",
    name: "着陸痕",
    englishName: "Landing Trace",
    category: "接近・着陸",
    summary: "UFOが地面に接近・着陸した跡とされる、圧痕や変色などの痕跡。",
    experienceContext:
      "近接遭遇や着陸事例で、目撃後に地面や植物へ痕跡が残ったとされるときに登場します。自然要因や人為要因の確認も必要です。",
    relatedEvents: ["ソコロ事件", "ヴァレンソール事件"],
    relatedTerms: ["着陸痕", "近接遭遇", "検証"],
  },
  {
    id: "engine-stall",
    name: "エンジン停止",
    englishName: "Engine Stall",
    category: "接近・着陸",
    summary: "UFO接近時に車や機械のエンジンが止まったとされる体験。",
    experienceContext:
      "古典的な近接遭遇でよく語られ、電磁効果と結びつきます。車両故障、環境条件、記憶の再構成も含めて慎重に扱う必要があります。",
    relatedEvents: ["レヴェランド事件"],
    relatedTerms: ["電磁効果 / EM効果", "近接遭遇", "検証"],
  },
  {
    id: "animal-reaction",
    name: "動物の反応",
    englishName: "Animal Reaction",
    category: "接近・着陸",
    summary: "UFO接近時に犬、家畜、野生動物などが異常に反応したとされる報告。",
    experienceContext:
      "物体の接近、音、光、環境変化に動物が反応したと語られます。接近遭遇の臨場感を強めるモチーフです。",
    relatedEvents: ["ケリー＝ホプキンスヴィル遭遇事件"],
    relatedTerms: ["近接遭遇", "キャトルミューティレーション", "ハイストレンジネス"],
  },
  {
    id: "small-being",
    name: "小柄な存在",
    englishName: "Small Being",
    category: "搭乗者・存在との遭遇",
    summary: "UFO近くや室内で、小柄な人型存在を見たとされる体験モチーフ。",
    experienceContext:
      "1950年代以降の着陸事例やアブダクション体験で現れます。グレイ、子どものような存在、防護服の存在など複数の語りに分かれます。",
    relatedEvents: ["ケリー＝ホプキンスヴィル遭遇事件", "ヒル夫妻事件"],
    relatedTerms: ["グレイ", "アブダクション", "ハイストレンジネス"],
  },
  {
    id: "grey",
    name: "グレイ",
    englishName: "Grey Alien",
    category: "搭乗者・存在との遭遇",
    summary: "大きな黒い目と小柄な体で語られる、現代UFO文化の代表的存在像。",
    experienceContext:
      "アブダクション体験、寝室訪問、身体検査、インプラントなどの語りと結びつきます。大衆文化を通じて定着したイメージでもあります。",
    relatedEvents: ["ヒル夫妻事件", "ホイットリー・ストリーバー体験"],
    relatedPeople: ["ホイットリー・ストリーバー", "バッド・ホプキンス"],
    relatedTerms: ["グレイ", "アブダクション", "インプラント"],
  },
  {
    id: "human-like-being",
    name: "人間そっくりの存在",
    englishName: "Human-like Being",
    category: "搭乗者・存在との遭遇",
    summary: "人間に近い姿をした宇宙人や搭乗者として語られる存在。",
    experienceContext:
      "コンタクティ文化では、友好的で美しい人間型の宇宙人として語られることがあります。スペースブラザーズのイメージと関係します。",
    relatedEvents: ["アダムスキーの金星人遭遇"],
    relatedPeople: ["ジョージ・アダムスキー"],
    relatedTerms: ["コンタクティ", "スペースブラザーズ", "金星人"],
  },
  {
    id: "suited-being",
    name: "防護服の存在",
    englishName: "Suited Being",
    category: "搭乗者・存在との遭遇",
    summary: "宇宙服や防護服のようなものを着た存在として語られるモチーフ。",
    experienceContext:
      "着陸事例や近接遭遇で、搭乗者がヘルメットやスーツを着ていたと報告されることがあります。SF的宇宙飛行士像とも重なります。",
    relatedEvents: ["ヴァレンソール事件", "ソコロ事件"],
    relatedTerms: ["近接遭遇", "搭乗者", "ハイストレンジネス"],
  },
  {
    id: "telepathic-contact",
    name: "テレパシー交信",
    englishName: "Telepathic Contact",
    category: "コンタクト体験",
    summary: "言葉や機械を使わず、精神的にメッセージを受け取ったとされる体験。",
    experienceContext:
      "コンタクティ文化やアブダクション体験で現れます。声ではなく頭の中に直接伝わる、夢のように理解する、と語られることがあります。",
    relatedPeople: ["ジョージ・アダムスキー", "ジョージ・ハント・ウィリアムソン"],
    relatedTerms: ["テレパシー交信", "コンタクティ", "スペースブラザーズ"],
  },
  {
    id: "peace-message",
    name: "平和メッセージ",
    englishName: "Peace Message",
    category: "コンタクト体験",
    summary: "宇宙人や高次存在から、核兵器や地球平和に関する警告を受けたとされる語り。",
    experienceContext:
      "1950年代のコンタクティ文化で特に目立ちます。冷戦、核兵器、地球文明への警告と結びつきます。",
    relatedPeople: ["ジョージ・アダムスキー", "ハワード・メンジャー"],
    relatedTerms: ["コンタクティ", "スペースブラザーズ", "平和思想"],
  },
  {
    id: "spaceship-ride",
    name: "宇宙船搭乗",
    englishName: "Spaceship Ride",
    category: "コンタクト体験",
    summary: "宇宙船に招かれ、内部を見た、旅をしたとされる体験。",
    experienceContext:
      "コンタクティ体験では友好的な案内として、アブダクション体験では本人の意思に反する移動として語られることがあります。",
    relatedEvents: ["アダムスキーの金星人遭遇", "ハワード・メンジャーのコンタクト"],
    relatedPeople: ["ジョージ・アダムスキー", "ハワード・メンジャー"],
    relatedTerms: ["宇宙船搭乗", "コンタクティ", "アブダクション"],
  },
  {
    id: "missing-time",
    name: "欠落時間",
    englishName: "Missing Time",
    category: "アブダクション体験",
    summary: "説明できない時間の空白。アブダクション体験でよく語られる。",
    experienceContext:
      "移動中や目撃後に、数十分から数時間の記憶が抜けていると感じる体験です。後から催眠や記憶の断片と結びつけられることがあります。",
    relatedEvents: ["ヒル夫妻事件", "トラヴィス・ウォルトン事件"],
    relatedPeople: ["ベティ＆バーニー・ヒル", "バッド・ホプキンス"],
    relatedTerms: ["欠落時間 / Missing Time", "アブダクション", "記憶の断片"],
  },
  {
    id: "bedroom-visitation",
    name: "寝室訪問",
    englishName: "Bedroom Visitation",
    category: "アブダクション体験",
    summary: "寝室や就寝中に存在が現れるとされる、アブダクション文化の代表的場面。",
    experienceContext:
      "グレイや小柄な存在が寝室に現れる、身体が動かない、光に包まれるといった体験と結びつきます。",
    relatedPeople: ["ホイットリー・ストリーバー", "ジョン・E・マック"],
    relatedTerms: ["アブダクション", "グレイ", "身体が動かない"],
  },
  {
    id: "entering-light",
    name: "光の中に入る",
    englishName: "Entering the Light",
    category: "アブダクション体験",
    summary: "強い光に包まれ、移動や搭乗へつながったとされる体験モチーフ。",
    experienceContext:
      "屋外や寝室で光に包まれ、その後の記憶が曖昧になる、浮遊する、宇宙船内にいたと語られる場面で現れます。",
    relatedEvents: ["トラヴィス・ウォルトン事件"],
    relatedTerms: ["アブダクション", "欠落時間 / Missing Time", "浮遊感"],
  },
  {
    id: "paralysis",
    name: "身体が動かない",
    englishName: "Paralysis",
    category: "アブダクション体験",
    summary: "体験中に身体を動かせないと感じる状態。寝室訪問と結びつきやすい。",
    experienceContext:
      "存在が近くにいるのに動けない、声が出ない、意識だけがあると語られます。睡眠麻痺との関係が検討されることもあります。",
    relatedPeople: ["ジョン・E・マック"],
    relatedTerms: ["アブダクション", "寝室訪問", "検証"],
  },
  {
    id: "floating-sensation",
    name: "浮遊感",
    englishName: "Floating Sensation",
    category: "アブダクション体験",
    summary: "身体が浮く、運ばれる、引き上げられると感じる体験。",
    experienceContext:
      "光の中に入る、宇宙船へ移動する、寝室から外へ運ばれるといったアブダクション場面で語られます。",
    relatedTerms: ["アブダクション", "光の中に入る", "宇宙船搭乗"],
  },
  {
    id: "medical-examination",
    name: "身体検査",
    englishName: "Medical Examination",
    category: "アブダクション体験",
    summary: "宇宙船内や白い部屋で、身体を調べられたとされる体験。",
    experienceContext:
      "アブダクション体験の中心的場面として、検査台、器具、グレイ、インプラントなどと結びついて語られます。",
    relatedEvents: ["ヒル夫妻事件"],
    relatedPeople: ["バッド・ホプキンス", "ジョン・E・マック"],
    relatedTerms: ["アブダクション", "インプラント", "グレイ"],
  },
  {
    id: "implant",
    name: "インプラント",
    englishName: "Implant",
    category: "アブダクション体験",
    summary: "体内に小さな物体を埋め込まれたとされるアブダクション関連モチーフ。",
    experienceContext:
      "身体検査や欠落時間のあと、鼻、耳、皮膚の下などに異物があると語られることがあります。医学的・物理的検証が重要です。",
    relatedPeople: ["バッド・ホプキンス"],
    relatedTerms: ["インプラント", "アブダクション", "検証"],
  },
  {
    id: "memory-fragments",
    name: "記憶の断片",
    englishName: "Memory Fragments",
    category: "アブダクション体験",
    summary: "体験後に断片的な映像や感覚だけが残るとされる記憶表現。",
    experienceContext:
      "欠落時間のあとに、光、存在、部屋、検査台などの断片だけを思い出す形で語られます。催眠回帰と関連づけられることもあります。",
    relatedPeople: ["バッド・ホプキンス", "ジョン・E・マック"],
    relatedTerms: ["欠落時間 / Missing Time", "アブダクション", "催眠回帰"],
  },
  {
    id: "time-distortion",
    name: "時間の歪み",
    englishName: "Time Distortion",
    category: "心理・時間感覚の異常",
    summary: "時間が長く、短く、止まったように感じられる体験。",
    experienceContext:
      "目撃中や接近遭遇、アブダクション体験で、実際の時間と体感時間がずれると語られます。欠落時間とも近いモチーフです。",
    relatedTerms: ["欠落時間 / Missing Time", "ハイストレンジネス", "体験"],
  },
  {
    id: "dreamlike-feeling",
    name: "夢のような感覚",
    englishName: "Dreamlike Feeling",
    category: "心理・時間感覚の異常",
    summary: "現実の出来事なのに夢の中のように感じられる体験表現。",
    experienceContext:
      "コンタクト、寝室訪問、ハイストレンジネス体験で語られます。現実感の喪失や記憶の断片と重なります。",
    relatedTerms: ["ハイストレンジネス", "寝室訪問", "記憶の断片"],
  },
  {
    id: "loss-of-reality",
    name: "現実感の喪失",
    englishName: "Loss of Reality",
    category: "心理・時間感覚の異常",
    summary: "周囲の現実感が薄れ、場面全体が異質に感じられる状態。",
    experienceContext:
      "通常の目撃よりも奇妙さが強い体験で現れます。音が消える、空気が変わる、周囲と切り離されるといった語りと結びつきます。",
    relatedTerms: ["ハイストレンジネス", "現実感", "恐怖感"],
  },
  {
    id: "fear-response",
    name: "恐怖感",
    englishName: "Fear Response",
    category: "心理・時間感覚の異常",
    summary: "目撃や遭遇の最中に強い恐怖や畏怖を感じる体験。",
    experienceContext:
      "未知の光、近接遭遇、アブダクション、MIB訪問などで語られます。恐怖だけでなく、畏敬や混乱として表現されることもあります。",
    relatedTerms: ["近接遭遇", "アブダクション", "MIB / メン・イン・ブラック"],
  },
  {
    id: "mib-visit",
    name: "MIBの訪問",
    englishName: "Men in Black Visit",
    category: "周辺怪異・ハイストレンジネス",
    summary: "UFO目撃後に、黒服の人物が訪ねてきたとされるモチーフ。",
    experienceContext:
      "黒いスーツの男たちが目撃直後に訪ねてきて目撃を口外しないよう警告する、表情やしゃべり方が不自然で機械的に見える、身分証や所属を示さないなど、普通の政府関係者とは違う印象を残す体験として語られます。1953年のアルバート・K・ベンダーの体験談が広まったことで定着したモチーフです。",
    relatedPeople: ["アルバート・K・ベンダー", "グレイ・バーカー", "ジョン・キール"],
    relatedTerms: ["MIB / メン・イン・ブラック", "ハイストレンジネス", "UFO神話"],
  },
  {
    id: "electronic-anomaly",
    name: "電子機器の異常",
    englishName: "Electronic Anomaly",
    category: "周辺怪異・ハイストレンジネス",
    summary: "UFO接近時や体験前後に、電子機器が不調になったとされる報告。",
    experienceContext:
      "車、ラジオ、時計、照明、電話などが止まる、乱れる、誤作動すると語られます。電磁効果と近いモチーフです。",
    relatedEvents: ["レヴェランド事件"],
    relatedTerms: ["電磁効果 / EM効果", "近接遭遇", "検証"],
  },
  {
    id: "strange-coincidence",
    name: "奇妙な偶然",
    englishName: "Strange Coincidence",
    category: "周辺怪異・ハイストレンジネス",
    summary: "UFO体験の前後に、意味ありげな偶然や連鎖が起きたと感じるモチーフ。",
    experienceContext:
      "数字、電話、夢、人物との遭遇、ニュースなどが不思議に結びついたと語られます。ハイストレンジネス文脈で重要です。",
    relatedPeople: ["ジョン・キール", "ジャック・ヴァレ"],
    relatedTerms: ["ハイストレンジネス", "ウルトラテレストリアル", "トリックスター的振る舞い"],
  },
  {
    id: "trickster-behavior",
    name: "トリックスター的振る舞い",
    englishName: "Trickster Behavior",
    category: "周辺怪異・ハイストレンジネス",
    summary: "現象が人をからかう、意味をずらす、説明を逃れるように見える振る舞い。",
    experienceContext:
      "撮影しようとすると機材が故障する、証人に近づくと無関係な偶然が重なる、決定的な証拠だけがすり抜けるように失われるなど、単純な機械現象ではなく民間伝承や超常現象に近い語りで現れます。ジョン・キールはこうした振る舞いを、現象が意図的に人を翻弄しているかのような「トリックスター」的性質として論じました。",
    relatedPeople: ["ジョン・キール", "ジャック・ヴァレ"],
    relatedTerms: ["ハイストレンジネス", "ウルトラテレストリアル", "民間伝承"],
  },
];
