export type ClarkScrollScene = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  visualMode: "text" | "image" | "video" | "arnold-motion" | "sighting-wave";
  imageSrc?: string;
  videoSrc?: string;
  videoSrcMp4?: string;
  visualTitle?: string;
  visualCaption?: string;
  visualCredit?: string;
  visualCreditUrl?: string;
  quote?: string;
};

export type ClarkPersonBlock = {
  name: string;
  role: string;
  bio: string;
  testimony: string;
  impact: string;
};

export type ClarkCaseRecord = {
  slug: "kenneth-arnold" | "george-adamski" | "billy-meier";
  title: string;
  displayTitleJa: string;
  displayTitleEn: string;
  cardCtaLabel: string;
  subtitle: string;
  yearLabel: string;
  placeLabel: string;
  summary: string;
  tags: string[];
  heroVideo: string;
  heroVideoMobile: string;
  heroVideoMp4?: string;
  heroVideoMobileMp4?: string;
  heroPoster: string;
  videoPoster: string;
  modelPath: string;
  overviewHeading?: string;
  whatHappened: string;
  scrollScenes: ClarkScrollScene[];
  person: ClarkPersonBlock;
  whyItMatters: string;
  believerView: string;
  skepticView: string;
  neutralSummary: string;
  nextCaseSlug: ClarkCaseRecord["slug"];
};

export const clarkCases: ClarkCaseRecord[] = [
  {
    slug: "kenneth-arnold",
    title: "Kenneth Arnold",
    displayTitleJa: "ケネス・アーノルド事件",
    displayTitleEn: "Kenneth Arnold",
    cardCtaLabel: "個別ページへ",
    subtitle: "現代UFO史の起点",
    yearLabel: "1947",
    placeLabel: "アメリカ・ワシントン州 / レーニア山周辺",
    summary:
      "私有機を操縦していたケネス・アーノルドが、高速で飛ぶ奇妙な物体群を見たと語った事件。のちに「空飛ぶ円盤」という言葉が広まり、現代UFO史の出発点として記憶されるようになった。",
    tags: ["起点", "目撃証言", "空飛ぶ円盤", "1947"],
    heroVideo: "/clark/videos/kenneth-arnold-desktop.MOV",
    heroVideoMobile: "/clark/videos/kenneth-arnold-desktop.MOV",
    heroVideoMp4: "/clark/videos/kenneth-arnold-desktop.mp4",
    heroVideoMobileMp4: "/clark/videos/kenneth-arnold-desktop.mp4",
    heroPoster: "/clark/posters/kenneth-arnold-poster.svg",
    videoPoster: "/clark/video-posters/kenneth-arnold-video-poster.png",
    modelPath: "/models/saucers/kenneth-arnold.glb",
    whatHappened:
      "1947年6月24日、実業家でありパイロットでもあったケネス・アーノルドは、自家用機でワシントン州上空を飛行していた。その最中、レーニア山付近で山並みに沿うように移動する複数の奇妙な飛行体を目撃したと証言した。アーノルドはそれらを、翼のある普通の飛行機とは異なる形で、強い反射を伴いながら非常に高速で動く物体として語っている。新聞報道の過程で、彼の説明した動きが「水面を跳ねる皿のようだ」と要約され、やがて “flying saucer” という表現が急速に広まった。現代UFO文化の始点として読み解かれる事件である。",
    scrollScenes: [
      {
        id: "arnold-flight",
        eyebrow: "Scene 01",
        title: "晴れた空に、説明しづらい動きが走る",
        body:
          "アーノルドの証言で印象的なのは形そのものよりも動きである。視界の端から端へ滑るように移動し、単独ではなく複数が隊列のように現れたという語りは、単なる一点の発光体より強い印象を残した。",
        visualMode: "arnold-motion",
        quote: "皿そのものではなく、皿を水面に投げたときのような動きだった。",
      },
      {
        id: "arnold-report",
        eyebrow: "Scene 02",
        title: "証言は、報道の言葉に変換される",
        body:
          "事件が広く知られる転機は、目撃の瞬間よりも、その後の報道だった。1947年6月25日、アーノルドはオレゴン州ペンドルトンの地方紙 East Oregonian で、Nolan Skiff と Bill Bequette の取材を受けた。Bequette の記事は彼の語りを読者に伝わる比喩へ変換し、やがて見出しや配信記事の中で「空飛ぶ円盤」という言葉が独り歩きし始める。",
        visualMode: "video",
        videoSrc: "/clark/videos/kenneth-arnold-desktop.MOV",
        videoSrcMp4: "/clark/videos/kenneth-arnold-desktop.mp4",
      },
      {
        id: "arnold-wave",
        eyebrow: "Scene 03",
        title: "ひとつの事件が、目撃の連鎖を呼ぶ",
        body:
          "この報道以後、アメリカ各地で似たような目撃談が急増した。アーノルド事件は単体の謎としてだけでなく、『こういうものを見たと語ってよい』という文化的合図になったとも解釈できる。",
        visualMode: "sighting-wave",
      },
    ],
    person: {
      name: "Kenneth Arnold",
      role: "実業家 / パイロット / 目撃証言の当事者",
      bio: "アメリカの実業家であり、自家用機を操縦する経験を持つ人物。1947年の証言によって、世界的に知られる存在となった。",
      testimony:
        "彼の語りは『何を見たか』だけでなく、『どう動いたか』『どれほど速く見えたか』に重点がある。ここが後年のUFO証言の語彙にも影響した。",
      impact:
        "アーノルド自身は神秘主義的な物語の中心人物というより、報道と証言の交差点に立つ人物であり、UFO文化の始発点を象徴する存在となった。",
    },
    whyItMatters:
      "ケネス・アーノルド事件が重要なのは、後年の多くの事件のように写真や物証が中心にあるからではない。そうではなく、ひとつの目撃証言が、言葉、見出し、想像上のイメージを通じて社会全体に広がり、『UFOを見るとはどういうことか』の初期テンプレートを作ったからである。この事件以後、空に現れる説明困難なものは、単なる珍しい現象ではなく、『円盤』として語られるようになった。",
    believerView:
      "信じる側にとって、この事件は極めて初期の、利害関係の薄い目撃者による誠実な証言として読まれる。空に複数の未知の飛行体がいたという事実そのものが、現代UFO史の信頼できる出発点だとみなされる。",
    skepticView:
      "疑う側は、距離感と速度推定の難しさ、山岳地形による視覚錯誤、報道段階での表現の誇張に注目する。現象の正体よりも、物語がどのように形成されたかを検討すべきだという立場である。",
    neutralSummary:
      "Clark では、この事件を『答えが出た最初のUFO事件』としてではなく、『UFOを語る言葉が生まれた事件』として位置づける。何が見えたのかという問いと同じくらい、どう伝わったのかという問いが重要である。",
    nextCaseSlug: "george-adamski",
  },
  {
    slug: "george-adamski",
    title: "George Adamski",
    displayTitleJa: "ジョージ・アダムスキー事件",
    displayTitleEn: "George Adamski",
    cardCtaLabel: "個別ページへ",
    subtitle: "コンタクティ文化の代表",
    yearLabel: "1952-1955",
    placeLabel: "アメリカ・カリフォルニア州 / 砂漠地帯",
    summary:
      "ジョージ・アダムスキーは、円盤写真と異星人接触の物語を通じて、UFOを『乗り物』から『接触のドラマ』へと変えた代表的人物である。",
    tags: ["コンタクティ", "写真", "接触", "1950s"],
    heroVideo: "/clark/videos/george-adamski-desktop.MOV",
    heroVideoMobile: "/clark/videos/george-adamski-desktop.MOV",
    heroVideoMp4: "/clark/videos/george-adamski-desktop.mp4",
    heroVideoMobileMp4: "/clark/videos/george-adamski-desktop.mp4",
    heroPoster: "/clark/posters/george-adamski-poster.svg",
    videoPoster: "/clark/video-posters/george-adamski-video-poster.png",
    modelPath: "/models/saucers/adamski.glb",
    whatHappened:
      "1952年11月20日、ジョージ・アダムスキーは数人の同行者とともにカリフォルニア州 Desert Center 近辺の砂漠地帯にいたとされる。彼の語りでは、空に葉巻型の巨大な物体が見え、それが自分を探していると感じたアダムスキーは、同行者たちから離れて一人で砂漠の奥へ歩いていった。やがて小型の偵察船が近くに着陸し、そこから金星人 Orthon が現れた、と彼は説明した。Orthon は長い金髪、日焼けした肌を持つ人間に近い姿で、言葉ではなくテレパシーや身振りによって意思を伝えたとされる。会話の中心には核戦争への警告、人類の精神的未熟さ、地球外存在からの友好的なメッセージがあった。さらに、Orthon は写真撮影を拒み、代わりに写真プレートを求めたという話や、砂上に残された足跡と記号の型取り、後日の円盤写真へと物語は続いていく。",
    scrollScenes: [
      {
        id: "adamski-desert",
        eyebrow: "Scene 01",
        title: "Desert Center の乾いた広がりが、接触譚の舞台になる",
        body:
          "アダムスキーの Orthon 邂逅譚は、町や研究施設ではなく、視界を遮るものの少ない砂漠で語られた。遠くに残された同行者、ひとりで歩く人物、乾いた地面に着陸する小型機という構図が、物語の神秘性を強くしている。",
        visualMode: "image",
        imageSrc: "/clark/images/adamski-desert-center.jpg",
        visualTitle: "Desert Center 近辺のコロラド砂漠",
        visualCaption:
          "写真は Desert Center 近辺の Desert Lily Preserve。Orthon 邂逅が語られた砂漠地帯の空気を伝えるための現地参考画像であり、接触現場そのものの記録ではない。",
        visualCredit: "Photo: Bob Wick / Bureau of Land Management California, Public Domain",
        visualCreditUrl: "https://commons.wikimedia.org/wiki/File:Desert_Lily_Preserve_Calif.jpg",
        quote: "物体を見るだけでは終わらない。そこから物語が始まる。",
      },
      {
        id: "adamski-photo",
        eyebrow: "Scene 02",
        title: "写真は、信仰と疑惑の両方を生む",
        body:
          "彼の写真は古典的円盤像を決定づけた一方で、模型や日用品に似ているという批判も早くから受けた。にもかかわらず、写真は『見えた』ことを共有可能なかたちに変え、文化的影響を拡大させた。",
        visualMode: "video",
        videoSrc: "/clark/videos/george-adamski-desktop.MOV",
        videoSrcMp4: "/clark/videos/george-adamski-desktop.mp4",
      },
      {
        id: "adamski-message",
        eyebrow: "Scene 03",
        title: "UFOは機械ではなく、メッセージの器になる",
        body:
          "アダムスキーの物語では、UFOの速度や材質よりも、そこに乗る存在が何を語ったかが重視された。核戦争への警告、地球外文明からの忠告、精神的な教えという文脈が加わり、UFOは単なる機体ではなくメッセージを運ぶ媒体として読まれるようになった。",
        visualMode: "video",
        videoSrc: "/clark/videos/george-adamski-desktop.MOV",
        visualTitle: "Clarkによるコンタクティ文化の再構成映像",
        visualCaption:
          "表示映像はClarkによる演出映像。Adamskiの語った接触物語が、機体そのものよりも『誰が何を伝えたのか』へ重心を移したことを示すためのビジュアルである。",
      },
    ],
    person: {
      name: "George Adamski",
      role: "コンタクティ / 写真提示者 / 講演者",
      bio: "ポーランド生まれでアメリカで活動した人物。1950年代のコンタクティ文化を代表する名前として知られる。",
      testimony:
        "彼は異星人との直接接触、会話、警告の受領を語り、単なる目撃者ではなく『伝達者』として自らを位置づけた。",
      impact:
        "アダムスキーは写真文化、講演文化、精神世界的UFO観を結びつけ、後続のコンタクティ像に大きな影響を与えた。",
    },
    whyItMatters:
      "アダムスキー事件が重要なのは、UFOを『物体の謎』としてではなく、『宇宙人との接触』というドラマへと押し広げたからである。彼の写真は古典的円盤のイメージを固定化し、彼の語りは UFO を精神文化、宇宙倫理、終末警告と結びつけた。後の多くの接触譚は、この枠組みの影響を受けている。",
    believerView:
      "信じる側は、アダムスキーを単なる写真提供者ではなく、時代に先駆けて接触メッセージを伝えた人物とみなす。円盤写真と接触証言はひとつの体系として読まれる。",
    skepticView:
      "疑う側は、写真の造形的な不自然さ、証言の物語性の強さ、同時代の空想科学や神秘思想との近さを問題視する。証拠よりも信念に依存したケースだという見方である。",
    neutralSummary:
      "Clark では、アダムスキー事件を『本物か偽物か』だけで閉じず、UFOがいかにして宗教的・文化的な物語の器になったかを示す代表例として扱う。",
    nextCaseSlug: "billy-meier",
  },
  {
    slug: "billy-meier",
    title: "Billy Meier",
    displayTitleJa: "ビリー・マイヤー",
    displayTitleEn: "Billy Meier",
    cardCtaLabel: "人物ページへ",
    subtitle: "証拠文化と論争の人物",
    yearLabel: "1970s-1980s",
    placeLabel: "スイス",
    summary:
      "ビリー・マイヤーは、写真や映像によって世界的に知られた一方、模型・合成・演出疑惑も集中的に受けた。UFO証拠文化の光と影を象徴する存在である。",
    tags: ["写真", "映像", "論争", "証拠文化"],
    heroVideo: "/clark/videos/billy-meier-desktop.MOV",
    heroVideoMobile: "/clark/videos/billy-meier-desktop.MOV",
    heroVideoMp4: "/clark/videos/billy-meier-desktop.mp4",
    heroVideoMobileMp4: "/clark/videos/billy-meier-desktop.mp4",
    heroPoster: "/clark/posters/billy-meier-poster.svg",
    videoPoster: "/clark/video-posters/billy-meier-video-poster.png",
    modelPath: "/models/saucers/billy-meier.glb",
    overviewHeading: "ビリー・マイヤーについて",
    whatHappened:
      "ビリー・マイヤー、本名 Eduard Albert Meier は、1937年にスイスの Bülach で生まれた人物で、1970年代以降のUFOコンタクティ文化を代表する名前として知られる。彼は Plejaren と呼ぶ地球外存在との接触を主張し、Semjase などの相手との対話記録、円盤写真、フィルム映像、音声、金属片などを提示したとされる。のちに FIGU と呼ばれる団体を設立し、接触記録だけでなく精神的教えや生活思想を広く発信していった。マイヤーの特徴は、単に『見た』と語るだけではなく、膨大な視覚資料と接触記録を伴って自らの物語を構築した点にある。一方で、その資料群は支持者にとっては強い説得力を持つ一方、懐疑側からは模型、吊り下げ、演出、写真・映像の真正性をめぐる疑義の対象にもなってきた。",
    scrollScenes: [
      {
        id: "meier-frame",
        eyebrow: "Scene 01",
        title: "スイスの地方都市から、接触者の物語が始まる",
        body:
          "マイヤーはスイスの Bülach に生まれ、のちに世界的なUFOコンタクティとして知られるようになった。彼の物語は、遠い砂漠や軍事施設ではなく、ヨーロッパの地方的な生活圏と精神思想、写真文化が結びつくところから始まる。",
        visualMode: "image",
        imageSrc: "/clark/images/billy-meier-buelach.jpg",
        visualTitle: "Bülach, Switzerland",
        visualCaption:
          "写真はマイヤーの出身地 Bülach の街並み。人物紹介の導入として使う現地参考画像であり、マイヤー本人や接触現場の記録ではない。",
        visualCredit: "Photo: Paebi / Wikimedia Commons / CC BY-SA 4.0",
        visualCreditUrl: "https://commons.wikimedia.org/wiki/File:B%C3%BClach_Rathausbrunnen_02.JPG",
      },
      {
        id: "meier-film",
        eyebrow: "Scene 02",
        title: "写真だけでなく、映像も“証拠”として提示された",
        body:
          "マイヤーのケースが強い印象を残したのは、円盤写真だけでなく、フィルム映像、音声、金属片なども証拠として提示されたと語られているからである。映像は『動いている物体』という実在感を与え、支持者にとっては説得力を増す材料になった。一方で、動きがあるからこそ模型、吊り下げ、編集、撮影条件の検証対象にもなり、証拠らしさと疑義が同時に大きくなった。",
        visualMode: "video",
        videoSrc: "/clark/videos/billy-meier-desktop.MOV",
        videoSrcMp4: "/clark/videos/billy-meier-desktop.mp4",
        visualTitle: "Clarkによる再構成・演出映像",
        visualCaption:
          "表示映像はClarkによる再構成・演出映像であり、Billy Meier本人の原資料ではありません。ここでは、マイヤーのケースが写真だけでなく映像資料を含む“証拠文化”として語られたことを示している。",
        quote: "強い証拠に見えるものほど、強い検証にさらされる。",
      },
      {
        id: "meier-dispute",
        eyebrow: "Scene 03",
        title: "資料の多さが、事件を終わらせずに残し続ける",
        body:
          "マイヤーの名前が残り続ける理由は、写真、映像、接触記録、支持者による検証、批判者による反証が束になっているからである。資料が多いほど結論に近づくとは限らず、むしろ『何を証拠とみなすか』という問いを長く残す。",
        visualMode: "video",
        videoSrc: "/clark/videos/billy-meier-desktop.MOV",
        videoSrcMp4: "/clark/videos/billy-meier-desktop.mp4",
        visualTitle: "Clarkによる再構成・演出映像",
        visualCaption:
          "資料の多さと検証文化を示すClarkによる再構成映像。Billy Meier本人の原資料ではなく、写真・映像・接触記録が支持と疑義を同時に生んだ構造を見せるための演出である。",
      },
    ],
    person: {
      name: "Billy Meier",
      role: "コンタクティ / 写真・映像提示者",
      bio: "スイスのコンタクティとして知られ、多数の写真、映像、接触記録を公表した。",
      testimony:
        "彼の語りは接触相手の存在やメッセージだけでなく、膨大な視覚資料によって支えられている点が特徴である。",
      impact:
        "マイヤーは『証拠が豊富にあるケース』の象徴であると同時に、『それでも疑いは消えない』というUFO文化の緊張関係も体現している。",
    },
    whyItMatters:
      "ビリー・マイヤー事件は、UFO文化における証拠主義の夢と限界をもっとも鮮明に示す。写真や映像が増えれば決着に近づくわけではなく、むしろ検証、批判、信仰、反信仰の応酬が激しくなることを可視化したからである。この事件は、UFO論争が単に『見た / 見ない』の問題ではなく、『何を証拠とみなすか』の文化的争いであることを教える。",
    believerView:
      "信じる側は、これほど多くの写真や映像、証言群が揃ったケースは稀だと考える。マイヤー事件は、コンタクトの記録が体系的に残された重要事例だという評価になる。",
    skepticView:
      "疑う側は、資料量の多さがそのまま真実性を保証しないことを強調する。模型や演出可能性、周辺証言の不整合、過剰な物語性が検証上の最大の問題点とされる。",
    neutralSummary:
      "Clark では、マイヤー事件を『証拠があるから終わる事件』ではなく、『証拠が多いからこそ終わらない事件』として読む。ここでは写真も映像も、答えそのものではなく論争を駆動する装置になる。",
    nextCaseSlug: "kenneth-arnold",
  },
];

export const clarkCasesBySlug = new Map(clarkCases.map((record) => [record.slug, record]));

export function getClarkCase(slug: string) {
  return clarkCasesBySlug.get(slug as ClarkCaseRecord["slug"]);
}
