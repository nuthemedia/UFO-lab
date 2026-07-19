import type { SaucerpediaRelation, SaucerpediaSource } from "./types";

export type SaucerpediaFake = {
  id: string;
  name: string;
  englishName?: string;
  aliases?: string[];
  category: "UFOとフェイク";
  kind: "物理トリック" | "撮影トリック" | "デジタル加工" | "AI生成" | "確認方法";
  summary: string;
  quickRead: string;
  whyBelievable?: string;
  howToCheck: string[];
  relatedTerms: SaucerpediaRelation[];
  sources?: SaucerpediaSource[];
};

export const fakeKinds = ["物理トリック", "撮影トリック", "デジタル加工", "AI生成", "確認方法"];

export const saucerpediaFakes: SaucerpediaFake[] = [
  {
    id: "model-ufo",
    name: "模型UFO",
    englishName: "Model UFO",
    category: "UFOとフェイク",
    kind: "物理トリック",
    summary: "小型の模型を撮影し、本物のUFO写真のように見せる手法。",
    quickRead:
      "模型UFOは、小さな円盤や物体を作り、空や風景を背景に撮影して本物のUFOのように見せる手法です。古いUFO写真では、模型を吊るす、投げる、近距離で撮るなどの方法が使われたと疑われる例があります。",
    whyBelievable:
      "写真だけでは、物体の大きさや距離がわかりにくいためです。空を背景に撮ると、数センチの模型でも遠くの巨大物体のように見えることがあります。",
    howToCheck: ["影や光源の向きを見る", "ピントと背景との距離感を確認する", "吊り糸や支えの痕跡を探す", "連続写真や撮影者の説明を確認する"],
    relatedTerms: [
      { type: "fake", id: "string-suspension" },
      { type: "fake", id: "miniature-photography" },
      { type: "fake", id: "composite-photo" },
      { type: "fake", id: "source-check" },
    ],
  },
  {
    id: "string-suspension",
    name: "吊り糸",
    englishName: "Suspension String",
    aliases: ["ワイヤー"],
    category: "UFOとフェイク",
    kind: "物理トリック",
    summary: "模型や物体を糸で吊り、空中に浮いているように見せる古典的な手法。",
    quickRead:
      "吊り糸は、模型や小物を細い糸やワイヤーで吊って撮影する方法です。解像度が低い写真や圧縮された動画では糸が見えにくく、物体だけが空中に浮いているように見えることがあります。",
    whyBelievable:
      "細い糸は背景や空の明るさに溶け込みやすく、古い写真や低画質のコピーでは痕跡が消えやすいためです。",
    howToCheck: ["物体の上部に不自然な線がないか見る", "影や揺れ方が吊られた物体に見えないか確認する", "高解像度版や初出画像を探す"],
    relatedTerms: [
      { type: "fake", id: "model-ufo" },
      { type: "fake", id: "trick-photo" },
      { type: "fake", id: "source-check" },
    ],
  },
  {
    id: "miniature-photography",
    name: "ミニチュア撮影",
    englishName: "Miniature Photography",
    category: "UFOとフェイク",
    kind: "撮影トリック",
    summary: "小さな模型を遠近感や背景で大きな物体のように見せる撮影手法。",
    quickRead:
      "ミニチュア撮影は、小さな模型を近距離で撮り、背景の空や建物と重ねて巨大な飛行物体のように見せる手法です。映画や特撮でも使われる表現ですが、UFO写真では距離感の誤解につながります。",
    whyBelievable:
      "単一の写真では、対象の実際の距離、サイズ、撮影位置が読み取りにくく、背景との関係だけで巨大物体に見えてしまうためです。",
    howToCheck: ["ピントが背景と同じ距離に見えるか確認する", "影や照明のスケール感を見る", "撮影場所や別角度の写真を確認する"],
    relatedTerms: [
      { type: "fake", id: "model-ufo" },
      { type: "term", id: "verification", label: "遠近感" },
      { type: "fake", id: "trick-photo" },
    ],
  },
  {
    id: "thrown-object",
    name: "投げた皿・物体",
    englishName: "Thrown Object",
    aliases: ["投げ物"],
    category: "UFOとフェイク",
    kind: "物理トリック",
    summary: "皿や帽子などを空に投げ、飛行中のUFOのように撮影する手法。",
    quickRead:
      "投げた皿・物体は、日用品を空中へ投げて一瞬を撮影する古典的なトリックです。ブレや低解像度により、皿、帽子、フリスビーなどが円盤状UFOのように見えることがあります。",
    whyBelievable:
      "空を背景にした一枚写真では、投げた物体の大きさや距離がわかりにくく、飛行軌跡も読み取りにくいためです。",
    howToCheck: ["物体に回転ブレや投げ物らしい傾きがないか見る", "連続写真があるか確認する", "撮影者に近すぎるピントや影を確認する"],
    relatedTerms: [
      { type: "fake", id: "model-ufo" },
      { type: "fake", id: "trick-photo" },
      { type: "term", id: "flying-saucer" },
    ],
  },
  {
    id: "through-glass",
    name: "ガラス越し撮影",
    englishName: "Through Glass Shot",
    category: "UFOとフェイク",
    kind: "撮影トリック",
    summary: "窓やガラス面の反射を利用して、空に物体があるように見せる撮影。",
    quickRead:
      "ガラス越し撮影では、室内の光や小物の映り込みが外の空と重なります。作為的に使われる場合も、偶然の映り込みがフェイクのように拡散される場合もあります。",
    whyBelievable:
      "写真ではガラス面の存在が見えにくく、反射した室内物が外の空に浮いているように見えるためです。",
    howToCheck: ["窓枠や室内反射の痕跡を見る", "撮影場所が車内・機内・室内か確認する", "カメラ位置の変化と光の動きが連動するか見る"],
    relatedTerms: [
      { type: "misidentification", id: "window-reflection" },
      { type: "misidentification", id: "reflection" },
      { type: "fake", id: "trick-photo" },
    ],
  },
  {
    id: "double-exposure",
    name: "二重露光",
    englishName: "Double Exposure",
    category: "UFOとフェイク",
    kind: "撮影トリック",
    summary: "複数の像を重ね、空に本来ない物体や光が写ったように見せる写真手法。",
    quickRead:
      "二重露光は、同じフィルムや画像に複数の像を重ねる手法です。フィルム写真の時代には、別の光や物体が空に写ったような画像を作るために使われることがありました。",
    whyBelievable:
      "重なった像が写真の中に自然に溶け込むと、撮影時に実際に空にあったもののように見えるためです。",
    howToCheck: ["重なった輪郭や透けを確認する", "粒子感やコントラストの違いを見る", "フィルムや元画像の来歴を確認する"],
    relatedTerms: [
      { type: "fake", id: "composite-photo" },
      { type: "fake", id: "trick-photo" },
      { type: "fake", id: "source-check" },
    ],
  },
  {
    id: "composite-photo",
    name: "合成写真",
    englishName: "Composite Photo",
    category: "UFOとフェイク",
    kind: "デジタル加工",
    summary: "別々の画像素材を組み合わせ、UFOが写ったように見せる写真。",
    quickRead:
      "合成写真は、空の写真に別の物体、光、円盤状の画像を重ねて作られます。古い写真技術でもデジタル加工でも可能で、SNSでは元画像の文脈が失われやすい対象です。",
    whyBelievable:
      "光や色、ノイズを合わせると、別素材でも一枚の写真として自然に見えることがあるためです。",
    howToCheck: ["光源と影が一致するか見る", "境界のにじみや切り抜き痕を確認する", "逆画像検索で素材や初出を探す"],
    relatedTerms: [
      { type: "fake", id: "image-editing" },
      { type: "fake", id: "reverse-image-search" },
      { type: "fake", id: "source-check" },
    ],
  },
  {
    id: "trick-photo",
    name: "トリック写真",
    englishName: "Trick Photo",
    category: "UFOとフェイク",
    kind: "撮影トリック",
    summary: "遠近感、反射、露光、模型などを使い、本物らしく見せる写真全般。",
    quickRead:
      "トリック写真は、撮影時の工夫で現実とは違う見え方を作る写真です。UFO写真では、模型、反射、遠近法、二重露光などが組み合わされることがあります。",
    whyBelievable:
      "写真は一見すると客観的な記録に見えるため、撮影条件や仕掛けが隠れると説得力を持ちやすいためです。",
    howToCheck: ["撮影状況の説明を確認する", "同じ場所・同じ時間の別写真を探す", "物体と背景のピントや光を比べる"],
    relatedTerms: [
      { type: "fake", id: "model-ufo" },
      { type: "fake", id: "string-suspension" },
      { type: "fake", id: "double-exposure" },
      { type: "term", id: "verification" },
    ],
  },
  {
    id: "cgi",
    name: "CGI / CG映像",
    englishName: "CGI",
    aliases: ["Computer Generated Imagery", "CG映像"],
    category: "UFOとフェイク",
    kind: "デジタル加工",
    summary: "3Dモデルや映像効果で、存在しないUFOを動画内に作る手法。",
    quickRead:
      "CGI / CG映像は、3Dモデルや映像合成でUFOらしい物体を作る手法です。カメラ揺れ、ノイズ、圧縮を加えると、スマホ動画や監視カメラ映像のように見せることもできます。",
    whyBelievable:
      "現代のCGは光、影、ブレ、ノイズをかなり自然に再現でき、短い動画では不自然さを見抜きにくいためです。",
    howToCheck: ["影や反射が環境と一致するか見る", "カメラ揺れと物体の動きが自然か確認する", "初出アカウントや制作文脈を確認する"],
    relatedTerms: [
      { type: "fake", id: "video-editing" },
      { type: "fake", id: "ai-video" },
      { type: "fake", id: "source-check" },
    ],
  },
  {
    id: "image-editing",
    name: "画像加工",
    englishName: "Image Editing",
    category: "UFOとフェイク",
    kind: "デジタル加工",
    summary: "写真に物体や光を追加・修正して、UFO写真のように見せる加工。",
    quickRead:
      "画像加工は、写真編集アプリで物体を追加したり、明るさや色を調整したりしてUFOらしく見せる方法です。軽い加工でも、切り抜きや圧縮を経ると確認が難しくなります。",
    whyBelievable:
      "加工後の画像だけが共有されると、元写真との差分や編集履歴が見えなくなるためです。",
    howToCheck: ["不自然な境界やノイズ差を見る", "EXIF情報や元画像を確認する", "逆画像検索で元写真を探す"],
    relatedTerms: [
      { type: "fake", id: "composite-photo" },
      { type: "fake", id: "exif" },
      { type: "fake", id: "reverse-image-search" },
    ],
  },
  {
    id: "video-editing",
    name: "動画加工",
    englishName: "Video Editing",
    category: "UFOとフェイク",
    kind: "デジタル加工",
    summary: "動画に光や物体を追加し、目撃映像のように見せる編集。",
    quickRead:
      "動画加工は、撮影済みの映像にUFOらしい光や物体を追加する方法です。短いクリップ、強い圧縮、手ぶれがある映像では、加工痕が見えにくくなります。",
    whyBelievable:
      "動きがある映像は写真よりも本物らしく感じられますが、編集ソフトで揺れやブレに合わせた合成も可能なためです。",
    howToCheck: ["物体の動きとカメラ揺れの関係を見る", "フレームごとの境界やブレを確認する", "長い未編集版や初出を探す"],
    relatedTerms: [
      { type: "fake", id: "cgi" },
      { type: "fake", id: "clipped-video" },
      { type: "fake", id: "source-check" },
    ],
  },
  {
    id: "clipped-video",
    name: "切り抜き動画",
    englishName: "Clipped Video",
    aliases: ["短尺切り抜き"],
    category: "UFOとフェイク",
    kind: "デジタル加工",
    summary: "前後の文脈を切り落とし、普通の対象を不可解に見せる動画。",
    quickRead:
      "切り抜き動画は、前後の説明や長い映像を削り、もっとも不可解に見える部分だけを見せる方法です。加工がなくても、文脈が消えることでUFOらしく見えることがあります。",
    whyBelievable:
      "短い動画では、対象がどこから来てどこへ消えたのか、撮影者が何を見ていたのかを判断しにくいためです。",
    howToCheck: ["元動画や長尺版を探す", "投稿日時と初出を確認する", "切り抜かれた前後に説明がないか見る"],
    relatedTerms: [
      { type: "fake", id: "source-check" },
      { type: "fake", id: "video-editing" },
      { type: "term", id: "verification" },
    ],
  },
  {
    id: "ai-image",
    name: "AI生成画像",
    englishName: "AI-generated Image",
    category: "UFOとフェイク",
    kind: "AI生成",
    summary: "生成AIで作られた、実在しないUFO写真風の画像。",
    quickRead:
      "AI生成画像は、生成AIで作られたUFO写真風の画像です。古い写真風、ニュース写真風、スマホ写真風などの雰囲気を簡単に作れるため、文脈なしで拡散されると本物らしく見えることがあります。",
    whyBelievable:
      "AIは写真らしいノイズ、構図、空気感を再現でき、見る人が期待するUFO写真の雰囲気を作りやすいためです。",
    howToCheck: ["細部の破綻や文字の不自然さを見る", "初出と生成文脈を確認する", "逆画像検索で出どころを探す"],
    relatedTerms: [
      { type: "fake", id: "image-editing" },
      { type: "fake", id: "reverse-image-search" },
      { type: "fake", id: "source-check" },
    ],
  },
  {
    id: "ai-video",
    name: "AI生成動画",
    englishName: "AI-generated Video",
    category: "UFOとフェイク",
    kind: "AI生成",
    summary: "生成AIで作られた、実在しないUFO目撃風の動画。",
    quickRead:
      "AI生成動画は、生成AIで作られたUFO目撃風の映像です。短い時間なら、空、雲、手ぶれ、光体を自然に見せられることがあり、SNS上では実写と区別しにくい場合があります。",
    whyBelievable:
      "短尺動画では、形の崩れや物理的な不自然さに気づく前に印象だけが残りやすいためです。",
    howToCheck: ["物体や雲の形が時間で破綻しないか見る", "光や影の一貫性を確認する", "初出、制作意図、生成AI表記を探す"],
    relatedTerms: [
      { type: "fake", id: "cgi" },
      { type: "fake", id: "video-editing" },
      { type: "fake", id: "source-check" },
    ],
  },
  {
    id: "source-check",
    name: "初出確認",
    englishName: "Source Check",
    aliases: ["出どころ確認"],
    category: "UFOとフェイク",
    kind: "確認方法",
    summary: "画像や動画が最初にどこで、どんな文脈で出たのかを確認する方法。",
    quickRead:
      "初出確認は、UFO画像や動画が最初に投稿・公開された場所を探す検証方法です。再投稿や切り抜きでは説明が失われるため、最初の文脈を確認することが重要です。",
    howToCheck: ["最古の投稿日時を探す", "投稿者の説明や返信を見る", "ニュース化される前の原文脈を確認する"],
    relatedTerms: [
      { type: "fake", id: "reverse-image-search" },
      { type: "fake", id: "exif" },
      { type: "fake", id: "clipped-video" },
    ],
  },
  {
    id: "reverse-image-search",
    name: "逆画像検索",
    englishName: "Reverse Image Search",
    category: "UFOとフェイク",
    kind: "確認方法",
    summary: "画像の出どころや過去の使用例を探し、別文脈の再利用を確認する方法。",
    quickRead:
      "逆画像検索は、画像をもとに同じ画像や似た画像の過去の掲載例を探す方法です。UFO写真として拡散された画像が、実は古い素材、映画、アート、別事件の写真だったとわかることがあります。",
    howToCheck: ["画像検索サービスで同一画像を探す", "古い掲載日時を比較する", "トリミング前の画像や素材サイトを確認する"],
    relatedTerms: [
      { type: "fake", id: "source-check" },
      { type: "fake", id: "composite-photo" },
      { type: "fake", id: "image-editing" },
    ],
  },
  {
    id: "exif",
    name: "EXIF情報",
    englishName: "EXIF Metadata",
    aliases: ["メタデータ"],
    category: "UFOとフェイク",
    kind: "確認方法",
    summary: "写真に残る撮影日時、機種、設定などのメタデータを確認する方法。",
    quickRead:
      "EXIF情報は、写真ファイルに含まれる撮影日時、機種、レンズ、位置情報、編集ソフトなどのメタデータです。残っていれば撮影条件の手がかりになりますが、削除や改変も可能です。",
    howToCheck: ["撮影日時や機種が説明と合うか確認する", "編集ソフトの痕跡を見る", "EXIFがない場合も断定せず他の情報と合わせる"],
    relatedTerms: [
      { type: "fake", id: "image-editing" },
      { type: "fake", id: "source-check" },
      { type: "term", id: "verification" },
    ],
  },
];
