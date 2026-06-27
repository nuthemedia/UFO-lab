export type SaucerpediaResource = {
  id: string;
  name: string;
  englishName?: string;
  aliases?: string[];
  kind: "政府調査" | "政府・公的機関" | "法律・公開制度" | "公開資料" | "民間団体" | "報告受付・航空安全";
  era?: string;
  summary: string;
  quickRead: string;
  whatItDid: string;
  relatedPeople?: string[];
  relatedTerms: string[];
};

export const resourceKinds = [
  "政府調査",
  "政府・公的機関",
  "法律・公開制度",
  "公開資料",
  "民間団体",
  "報告受付・航空安全",
];

export const saucerpediaResources: SaucerpediaResource[] = [
  {
    id: "project-sign",
    name: "プロジェクト・サイン",
    englishName: "Project Sign",
    kind: "政府調査",
    era: "1948年",
    summary: "米空軍による初期UFO調査計画。戦後UFO問題を軍が扱い始めた出発点の一つ。",
    quickRead:
      "プロジェクト・サインは、1948年に米空軍が行った初期UFO調査計画です。1947年以降に増えた目撃報告を、軍事・航空安全の観点から調べるために始まりました。",
    whatItDid:
      "空飛ぶ円盤ブーム後の目撃報告を集め、航空機、気象現象、天体、未確認報告を分類しました。一部の調査官は地球外起源説を有力と見ていましたが、1949年に空軍上層部が結論を「脅威ではない」とする方向に転換させたため、プロジェクト・グラッジへ改称・縮小されました。米空軍UFO調査の初期段階として重要です。",
    relatedPeople: ["エドワード・J・ルッペルト", "J・アレン・ハイネック"],
    relatedTerms: ["UFO", "政府調査", "プロジェクト・グラッジ", "プロジェクト・ブルーブック"],
  },
  {
    id: "project-grudge",
    name: "プロジェクト・グラッジ",
    englishName: "Project Grudge",
    kind: "政府調査",
    era: "1949年-1951年",
    summary: "プロジェクト・サイン後の米空軍UFO調査。懐疑的な整理へ傾いた段階として知られる。",
    quickRead:
      "プロジェクト・グラッジは、プロジェクト・サインに続く米空軍のUFO調査計画です。UFO報告を脅威ではなく誤認や心理的要因として整理する姿勢が強まった時期として語られます。",
    whatItDid:
      "目撃報告を評価し、多くを誤認、気象現象、航空機、天体などで説明しようとしました。後にプロジェクト・ブルーブックへ引き継がれます。",
    relatedPeople: ["エドワード・J・ルッペルト"],
    relatedTerms: ["誤認", "懐疑派", "プロジェクト・サイン", "プロジェクト・ブルーブック"],
  },
  {
    id: "project-blue-book",
    name: "プロジェクト・ブルーブック",
    englishName: "Project Blue Book",
    kind: "政府調査",
    era: "1952年-1969年",
    summary: "米空軍による代表的なUFO調査計画。多数の目撃報告を収集・分類した。",
    quickRead:
      "プロジェクト・ブルーブックは、1952年から1969年まで続いた米空軍のUFO調査計画です。UFO史でもっとも有名な政府調査の一つで、J・アレン・ハイネックも関わりました。",
    whatItDid:
      "多数のUFO報告を収集し、説明済みと未確認に分類しました。最終的にはコンドン委員会の結論などを受けて終了しましたが、公開資料として現在もUFO研究の基本参照点になっています。",
    relatedPeople: ["J・アレン・ハイネック", "エドワード・J・ルッペルト"],
    relatedTerms: ["UFO", "IFO", "公開文書", "コンドン委員会"],
  },
  {
    id: "condon-committee",
    name: "コンドン委員会",
    englishName: "Condon Committee",
    aliases: ["コロラド大学UFOプロジェクト"],
    kind: "政府調査",
    era: "1966年-1968年",
    summary: "米空軍の委託で行われたUFO研究。ブルーブック終了の流れに大きく関わった。",
    quickRead:
      "コンドン委員会は、米空軍の委託を受けてコロラド大学で行われたUFO研究です。報告書は、UFO研究に大きな科学的価値は見いだせないという方向で受け止められました。",
    whatItDid:
      "複数のUFO事例を検討し、調査報告書をまとめました。その結論はプロジェクト・ブルーブック終了の重要な根拠となり、UFO研究史で大きな論争点にもなりました。",
    relatedPeople: ["J・アレン・ハイネック", "カール・セーガン"],
    relatedTerms: ["プロジェクト・ブルーブック", "懐疑派", "検証", "公開文書"],
  },
  {
    id: "robertson-panel",
    name: "ロバートソン・パネル",
    englishName: "Robertson Panel",
    kind: "政府調査",
    era: "1953年",
    summary: "CIAが招集したUFO評価会議。冷戦期の安全保障文脈でUFO報告を検討した。",
    quickRead:
      "ロバートソン・パネルは、1953年にCIAが招集した科学者・専門家によるUFO評価会議です。UFO報告そのものだけでなく、報告が社会や防空体制へ与える影響にも注目しました。",
    whatItDid:
      "UFO報告を検討し、未確認報告の情報価値や社会的影響を評価しました。UFO問題を安全保障、世論、情報管理の観点で扱った初期例として重要です。",
    relatedPeople: ["J・アレン・ハイネック"],
    relatedTerms: ["政府調査", "CIA", "UFOウェーブ", "デバンキング"],
  },
  {
    id: "aatip",
    name: "AATIP",
    englishName: "Advanced Aerospace Threat Identification Program",
    kind: "政府調査",
    era: "2000年代後半-2010年代",
    summary: "米国防総省関連の現代UAP調査プログラムとして知られる名称。",
    quickRead:
      "AATIPは、現代UAP文脈で広く知られる米国防総省関連の調査プログラム名です。2017年以降の報道で注目され、Tic Tac事件など現代UAPへの関心を高めました。",
    whatItDid:
      "国防情報局（DIA）内のプログラムとして2007年から2012年頃まで運用され、UAPを含む航空宇宙上の異常な脅威の評価に予算が割かれていたとされます。2017年にニューヨーク・タイムズなどの報道で存在が明らかになり、関係者だったルイス・エリゾンドが公の場でUAPの存在を語ったことで、現代UAPディスクロージャーの起点になりました。",
    relatedPeople: ["ルイス・エリゾンド", "クリストファー・メロン", "レスリー・キーン"],
    relatedTerms: ["UAP", "ディスクロージャー", "Tic Tac事件", "Kean"],
  },
  {
    id: "aaro",
    name: "AARO",
    englishName: "All-domain Anomaly Resolution Office",
    kind: "政府・公的機関",
    era: "2022年以降",
    summary: "米国防総省内のUAP関連組織。全領域の異常報告を扱う現代UAPの中心機関。",
    quickRead:
      "AAROは、米国防総省内でUAPなど全領域の異常報告を扱う組織です。現代UAP問題を政府がどのように整理しているかを見るうえで重要です。",
    whatItDid:
      "空中、海中、宇宙など複数領域の異常報告を受け、分析や報告を行う役割を持ちます。2022年の設立以降、毎年議会向けの年次報告書を公表し、収集した報告の大半は気球・ドローン・誤認などで説明可能としつつ、一部を未解明として残しています。現代UAPの制度的な窓口になっています。",
    relatedPeople: ["ショーン・カークパトリック", "ジョン・コスロスキー"],
    relatedTerms: ["UAP", "現代UAP", "政府・軍", "ディスクロージャー"],
  },
  {
    id: "nasa-uap-independent-study-team",
    name: "NASA UAP独立研究チーム",
    englishName: "NASA UAP Independent Study Team",
    kind: "政府・公的機関",
    era: "2022年-2023年",
    summary: "NASAが設置したUAP研究チーム。科学的データと透明性の観点からUAPを検討した。",
    quickRead:
      "NASA UAP独立研究チームは、NASAが設置した外部有識者によるUAP検討チームです。UAPを科学的に扱うために、どのようなデータや観測体制が必要かを議論しました。",
    whatItDid:
      "UAPの真偽を個別に判定するよりも、信頼できるデータ収集、透明性、科学的分析の枠組みを提案しました。現代UAPを研究対象として整える動きとして重要です。",
    relatedPeople: ["デイヴィッド・スペルゲル"],
    relatedTerms: ["UAP", "NASA", "検証", "公開文書"],
  },
  {
    id: "foia",
    name: "FOIA",
    englishName: "Freedom of Information Act",
    aliases: ["情報自由法"],
    kind: "法律・公開制度",
    era: "1966年以降",
    summary: "米国の情報公開制度。UFO関連文書の公開請求でも重要な役割を持つ。",
    quickRead:
      "FOIAは、米国政府機関に情報公開を求めるための法律です。UFO / UAP 関連では、過去の調査資料や政府文書を取得する手段として重要です。",
    whatItDid:
      "研究者やジャーナリスト、市民が政府文書の公開を請求できる制度を提供しました。UFO資料の調査では、公開文書や機密解除資料と並んで基礎的な用語です。",
    relatedPeople: ["ジョン・グリーンウォルド・Jr."],
    relatedTerms: ["公開文書", "機密解除", "Black Vault", "Ruppelt"],
  },
  {
    id: "public-documents",
    name: "公開文書",
    englishName: "Public Documents",
    kind: "公開資料",
    summary: "政府機関や研究機関が公開した、UFO / UAP 関連の資料や報告書。",
    quickRead:
      "公開文書は、政府機関や研究機関が公開したUFO / UAP 関連の資料です。報告書、メモ、目撃記録、議会資料などが含まれます。",
    whatItDid:
      "UFO研究で参照できる一次資料や公的資料の入口になります。プロジェクト・ブルーブックの調査ファイル、CIAやFBIがFOIAで開示した報告書、議会証言の記録などが代表例です。ただし、公開されていることと内容が正しいことは別なので、文脈や作成目的を確認する必要があります。",
    relatedTerms: ["FOIA", "機密解除", "プロジェクト・ブルーブック", "Ruppelt"],
  },
  {
    id: "declassification",
    name: "機密解除",
    englishName: "Declassification",
    kind: "法律・公開制度",
    summary: "機密扱いだった文書が公開可能になること。UFO資料公開の文脈でよく使われる。",
    quickRead:
      "機密解除は、政府などが秘密扱いしていた文書を公開可能にする手続きです。UFO / UAP 関連では、過去の調査資料や軍事文書が後から公開されることがあります。",
    whatItDid:
      "過去の文書が研究者や市民に利用できる状態になり、歴史的な検証の材料になります。ただし、黒塗りや一部非公開が残ることもあります。",
    relatedTerms: ["FOIA", "公開文書", "政府調査", "Ruppelt"],
  },
  {
    id: "black-vault",
    name: "Black Vault",
    englishName: "The Black Vault",
    kind: "公開資料",
    era: "1990年代以降",
    summary: "FOIAで取得した政府文書を公開する民間アーカイブ。UFO資料でもよく参照される。",
    quickRead:
      "Black Vaultは、ジョン・グリーンウォルド・Jr.が運営する政府文書アーカイブです。FOIAで取得した多数の文書を公開しており、UFO / UAP 資料の参照先として知られます。",
    whatItDid:
      "UFO関連を含む膨大な政府文書を収集・公開し、研究者や一般ユーザーが資料へアクセスしやすい状態を作りました。",
    relatedPeople: ["ジョン・グリーンウォルド・Jr."],
    relatedTerms: ["FOIA", "公開文書", "機密解除", "Ruppelt"],
  },
  {
    id: "nicap",
    name: "NICAP",
    englishName: "National Investigations Committee on Aerial Phenomena",
    kind: "民間団体",
    era: "1950年代-1980年",
    summary: "1950年代に設立された米国の民間UFO調査団体。UFOの公開調査を求めた。",
    quickRead:
      "NICAPは、1950年代に設立された米国の民間UFO調査団体です。ドナルド・キーホーらが関わり、UFO問題の公開調査を求めました。",
    whatItDid:
      "目撃報告を収集し、政府に対してUFO情報の公開や本格調査を求めました。軍や航空関係者の証言にも注目し、UFOを社会的・政治的な問題として扱いました。",
    relatedPeople: ["ドナルド・キーホー", "J・アレン・ハイネック"],
    relatedTerms: ["UFO研究", "公開文書", "ディスクロージャー", "政府調査"],
  },
  {
    id: "apro",
    name: "APRO",
    englishName: "Aerial Phenomena Research Organization",
    kind: "民間団体",
    era: "1952年-1988年",
    summary: "米国の民間UFO研究団体。目撃報告やコンタクト事例などを幅広く扱った。",
    quickRead:
      "APROは、1952年に設立された民間UFO研究団体です。目撃報告、着陸痕、コンタクト事例など幅広いUFO報告を収集しました。",
    whatItDid:
      "民間ベースでUFO報告を集め、会報や調査を通じて情報を共有しました。NICAPと並び、戦後アメリカの民間UFO研究を支えた団体です。",
    relatedPeople: ["ジム・ローレンゼン", "コーラル・ローレンゼン"],
    relatedTerms: ["UFO研究", "コンタクティ", "着陸痕", "民間団体"],
  },
  {
    id: "cufos",
    name: "CUFOS",
    englishName: "Center for UFO Studies",
    kind: "民間団体",
    era: "1973年以降",
    summary: "J・アレン・ハイネックが設立したUFO研究団体。科学的調査を重視した。",
    quickRead:
      "CUFOSは、J・アレン・ハイネックが設立したUFO研究団体です。プロジェクト・ブルーブック後に、民間でUFO報告を科学的に扱う場として作られました。",
    whatItDid:
      "目撃報告の収集、調査、研究資料の保存を行いました。ハイネックの近接遭遇分類や科学的UFO研究の文脈と深く関係します。",
    relatedPeople: ["J・アレン・ハイネック"],
    relatedTerms: ["近接遭遇", "UFO研究", "プロジェクト・ブルーブック"],
  },
  {
    id: "mufon",
    name: "MUFON",
    englishName: "Mutual UFO Network",
    kind: "民間団体",
    era: "1969年以降",
    summary: "米国発の民間UFO調査ネットワーク。目撃報告の受付と調査で知られる。",
    quickRead:
      "MUFONは、1969年に設立された民間UFO調査ネットワークです。一般からの目撃報告を受け付け、調査員ネットワークを通じて事例を整理してきました。",
    whatItDid:
      "目撃報告の受付、調査、データベース化、研究会や公開イベントを行いました。現代の民間UFO調査団体としてよく名前が挙がります。",
    relatedTerms: ["UFO研究", "目撃報告", "民間団体", "検証"],
  },
  {
    id: "nuforc",
    name: "NUFORC",
    englishName: "National UFO Reporting Center",
    kind: "報告受付・航空安全",
    era: "1974年以降",
    summary: "米国のUFO目撃報告センター。一般からの報告を長年受け付けている。",
    quickRead:
      "NUFORCは、米国のUFO目撃報告センターです。電話やオンラインで一般からの報告を受け付け、公開データとして蓄積してきました。",
    whatItDid:
      "目撃日時、場所、形状、説明などを集め、研究者や一般ユーザーが参照できる形で公開してきました。目撃報告の入口として重要です。",
    relatedTerms: ["目撃報告", "UFOウェーブ", "検証", "公開資料"],
  },
  {
    id: "narcap",
    name: "NARCAP",
    englishName: "National Aviation Reporting Center on Anomalous Phenomena",
    kind: "報告受付・航空安全",
    era: "1999年以降",
    summary: "航空関係者の異常現象報告に注目する民間組織。航空安全の文脈でUAPを扱う。",
    quickRead:
      "NARCAPは、航空関係者による異常現象報告を扱う民間組織です。UFO / UAP を単なる怪談ではなく、航空安全やパイロット報告の問題として整理します。",
    whatItDid:
      "パイロットや航空関係者の報告を集め、飛行安全、観測条件、報告文化の観点から分析しました。現代UAPの航空安全文脈とつながります。",
    relatedPeople: ["リチャード・ヘインズ"],
    relatedTerms: ["UAP", "航空安全", "目撃報告", "検証"],
  },
];
