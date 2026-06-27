export type SaucerpediaHistoryCard = {
  id: string;
  eraLabel: string;
  title: string;
  yearRange: string;
  summary: string;
  quickRead: string;
  milestones: string[];
  relatedTerms: string[];
  relatedEvents: string[];
};

export const saucerpediaHistoryCards: SaucerpediaHistoryCard[] = [
  {
    id: "mystery-airships",
    eraLabel: "現代UFO以前",
    title: "19世紀末の謎の飛行船",
    yearRange: "1896〜1897年",
    summary: "飛行機が一般化する前に、アメリカ各地で謎の飛行船が報じられた空の怪異ブーム。",
    quickRead:
      "19世紀末の謎の飛行船報道は、現代UFOという言葉が生まれる前にも、未知の飛行物が社会的な話題になったことを示します。1896〜97年にはカリフォルニアからシカゴまでアメリカ各地で、夜空を飛ぶ葉巻型の飛行船とその下のサーチライトを見たという報告が新聞をにぎわせました。実用的な飛行機がまだ存在しなかった時代に、発明家ブームへの期待、新聞の誇張報道、誤認が混ざって広まった前史として読むと見通しがよくなります。",
    milestones: ["新聞報道で目撃談が拡散", "飛行船発明への期待と結びつく", "現代UFO以前の空の怪異として参照される"],
    relatedTerms: ["UFOウェーブ", "誤認", "検証"],
    relatedEvents: ["謎の飛行船ウェーブ"],
  },
  {
    id: "flying-saucer-boom",
    eraLabel: "空飛ぶ円盤の成立",
    title: "1947年と空飛ぶ円盤ブーム",
    yearRange: "1947年",
    summary: "ケネス・アーノルド事件をきっかけに、空飛ぶ円盤という言葉と戦後UFO文化が広がった時期。",
    quickRead:
      "1947年は、現代的なUFO史の入口です。ケネス・アーノルド事件の報道で Flying Saucer という表現が広まり、ロズウェル事件なども含めて、UFOが目撃報告、軍、報道、大衆文化の交差点になりました。",
    milestones: ["ケネス・アーノルド事件", "Flying Saucer という表現の拡散", "ロズウェル事件が後年のUFO神話へ接続"],
    relatedTerms: ["UFO", "空飛ぶ円盤", "UFOウェーブ"],
    relatedEvents: ["ケネス・アーノルド事件", "ロズウェル事件"],
  },
  {
    id: "blue-book-and-contactees",
    eraLabel: "調査とコンタクト",
    title: "1950年代の政府調査とコンタクティ文化",
    yearRange: "1950年代",
    summary: "空軍調査、情報公開要求、友好的宇宙人との接触談が同時に広がった古典UFO文化の中心期。",
    quickRead:
      "1950年代は、UFOが政府・軍の調査対象として扱われる一方で、アダムスキー型のコンタクティ文化も広がった時期です。プロジェクト・ブルーブック、キーホー、スペースブラザーズを並べると、制度的調査と大衆的想像力の両方が見えてきます。",
    milestones: ["プロジェクト・ブルーブックの時代", "キーホーらによる情報公開要求", "アダムスキー型コンタクティ文化の拡大"],
    relatedTerms: ["プロジェクト・ブルーブック", "コンタクティ", "スペースブラザーズ"],
    relatedEvents: ["ワシントンD.C. UFO事件", "アダムスキーの金星人遭遇"],
  },
  {
    id: "close-encounters-and-abductions",
    eraLabel: "体験談の変化",
    title: "1960〜70年代の近接遭遇とアブダクション",
    yearRange: "1960〜70年代",
    summary: "近接遭遇、欠落時間、身体検査、グレイ像など、体験談の細部が濃くなっていった時期。",
    quickRead:
      "1960〜70年代には、単なる空の光だけでなく、接近遭遇、アブダクション、欠落時間、身体検査といった体験談が強く意識されるようになります。ヒル夫妻事件やハイストレンジネスの議論は、UFOを文化、心理、民間伝承の側から読む入口にもなります。",
    milestones: ["ヒル夫妻事件がアブダクション像に影響", "近接遭遇分類が広まる", "ハイストレンジネスの視点が強まる"],
    relatedTerms: ["近接遭遇", "アブダクション", "欠落時間 / Missing Time", "グレイ"],
    relatedEvents: ["ヒル夫妻事件", "トラヴィス・ウォルトン事件"],
  },
  {
    id: "popular-culture-and-rechecking",
    eraLabel: "神話化と再検証",
    title: "1980〜90年代の大衆文化と再検証",
    yearRange: "1980〜90年代",
    summary: "ロズウェル神話、テレビや映画、写真・映像検証、民間研究が重なり、UFO像が再編された時期。",
    quickRead:
      "1980〜90年代には、ロズウェルやアブダクションの物語が大衆文化で再拡大しました。同時に、写真・映像・証言を検証する視点も強まり、UFOは信じるか否かだけでなく、メディアや記憶、資料の読み方を問うテーマになりました。",
    milestones: ["ロズウェル神話の再拡大", "アブダクション体験談の大衆化", "写真・映像検証と民間研究の広がり"],
    relatedTerms: ["ロズウェル事件", "デバンキング", "検証", "アブダクション"],
    relatedEvents: ["ロズウェル事件", "ビリー・マイヤー事件"],
  },
  {
    id: "modern-uap",
    eraLabel: "現代UAP",
    title: "2000年代以降の現代UAP",
    yearRange: "2000年代以降",
    summary: "Tic Tac、AATIP、AARO、議会証言などを通じ、UAPが安全保障や航空安全の文脈で語られる時代。",
    quickRead:
      "2000年代以降、とくに2017年以降は、UAPが政府、軍、議会、航空安全の文脈で再び注目されました。Tic Tac、Gimbal、GoFast、AATIP、AAROを並べると、古典UFO文化とは違う制度的・政策的な語りが見えてきます。",
    milestones: ["Tic Tac事件が現代UAP文脈の代表例に", "AATIP報道で注目が拡大", "AAROや議会証言へ議論が接続"],
    relatedTerms: ["UAP", "AATIP", "AARO", "ディスクロージャー"],
    relatedEvents: ["Tic Tac事件", "Gimbal", "GoFast"],
  },
];
