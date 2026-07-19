import type { SaucerpediaRelation, SaucerpediaSource } from "./types";

export type SaucerpediaMisidentification = {
  id: string;
  name: string;
  englishName?: string;
  aliases?: string[];
  category: "UFOと誤認";
  kind: "天体" | "航空機" | "生物" | "カメラ由来" | "錯覚";
  summary: string;
  quickRead: string;
  whyItLooksLikeUfo: string;
  howToTell: string[];
  commonAppearance: string[];
  relatedTerms: SaucerpediaRelation[];
  sources?: SaucerpediaSource[];
};

export const misidentificationKinds = ["天体", "航空機", "生物", "カメラ由来", "錯覚"];

export const saucerpediaMisidentifications: SaucerpediaMisidentification[] = [
  {
    id: "venus",
    name: "金星",
    englishName: "Venus",
    category: "UFOと誤認",
    kind: "天体",
    summary: "夕方や明け方に非常に明るく見え、静止したUFOのように誤認されやすい惑星。",
    quickRead:
      "金星は、空で非常に明るく見えるため、動かない光体や低空のUFOとして報告されやすい天体です。特に夕方の西空、明け方の東空で目立ちます。",
    whyItLooksLikeUfo:
      "低い空に明るく輝き、雲や大気の揺らぎで点滅して見えることがあります。地上の景色と比較すると近くに浮いているように感じられ、長時間そこにあるため人工物のように見える場合があります。",
    howToTell: ["星図アプリで方角と高度を確認する", "数分で大きく移動しないか見る", "夕方の西空・明け方の東空なら金星を疑う"],
    commonAppearance: ["白く強い点光源", "低空でゆらめく光", "動かない明るい光"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "term", id: "ifo" },
      { type: "term", id: "verification" },
    ],
  },
  {
    id: "meteor",
    name: "流星",
    englishName: "Meteor",
    aliases: ["流れ星"],
    category: "UFOと誤認",
    kind: "天体",
    summary: "一瞬で空を横切る光。高速移動するUFOや墜落物のように見えることがある。",
    quickRead:
      "流星は、短時間で空を横切る発光現象です。突然現れて消えるため、急加速したUFOや墜落する物体のように受け取られることがあります。",
    whyItLooksLikeUfo:
      "視界に突然入り、数秒以内に消えるため、方向転換や急加速をしたように記憶される場合があります。雲の切れ間や建物の間から見ると、飛行距離や高さを誤って感じやすくなります。",
    howToTell: ["数秒以内に消えたか確認する", "同じ方向に再出現しないか見る", "流星群の時期や火球情報を確認する"],
    commonAppearance: ["白い線状の光", "短い尾を引く光", "一瞬で消える発光"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "term", id: "verification" },
      { type: "misidentification", id: "fireball" },
    ],
  },
  {
    id: "fireball",
    name: "火球",
    englishName: "Fireball",
    category: "UFOと誤認",
    kind: "天体",
    summary: "非常に明るい流星。爆発的な光や分裂により、異常な飛行物体に見えやすい。",
    quickRead:
      "火球は、通常の流星より明るく見える発光現象です。分裂、色変化、音の報告があると、墜落UFOや謎の飛行体のように語られることがあります。",
    whyItLooksLikeUfo:
      "非常に明るく、緑やオレンジに光ったり、破片のように分裂したりします。地平線近くを長く進む火球は、水平飛行する物体のように見えることもあります。",
    howToTell: ["広域で同時に目撃されていないか確認する", "天文台や火球観測情報を調べる", "数秒から十数秒で消えたか見る"],
    commonAppearance: ["緑や白の強い光", "尾を引く火の玉", "分裂して消える光"],
    relatedTerms: [
      { type: "misidentification", id: "meteor" },
      { type: "term", id: "misidentification" },
      { type: "term", id: "verification" },
    ],
  },
  {
    id: "lenticular-cloud",
    name: "レンズ雲",
    englishName: "Lenticular Cloud",
    category: "UFOと誤認",
    kind: "錯覚",
    summary: "山岳地帯などにできる滑らかな雲。円盤型UFOのような形に見える。",
    quickRead:
      "レンズ雲は、円盤や葉巻のような形をした雲です。動きが少なく、夕日で光ると巨大な母船や円盤のように見えることがあります。",
    whyItLooksLikeUfo:
      "輪郭が滑らかで、通常の雲より人工的な形に見えます。山の近くに固定されたように見えたり、夕焼けで金属的に光ったりすると、巨大物体のように感じられます。",
    howToTell: ["山や風下側に出ていないか見る", "形がゆっくり変化するか確認する", "雲として他の雲と連続していないか見る"],
    commonAppearance: ["円盤状の雲", "重なった皿のような雲", "動かない巨大な影"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "term", id: "flying-saucer" },
      { type: "term", id: "verification" },
    ],
  },
  {
    id: "airplane",
    name: "飛行機",
    englishName: "Airplane",
    category: "UFOと誤認",
    kind: "航空機",
    summary: "航行灯や着陸灯が、夜間に三角形・光体・静止物体のように見えることがある。",
    quickRead:
      "飛行機は、UFO誤認の代表です。遠方から向かってくる着陸灯は止まって見え、航行灯は点滅する複数の光として見えることがあります。",
    whyItLooksLikeUfo:
      "進行方向が観察者に向いていると、ほとんど動いていない明るい光に見えます。夜間は機体が見えず、複数の灯火だけが空中に浮いているように見えるため、三角形や編隊に感じられることもあります。",
    howToTell: ["FlightRadarなどで航路を確認する", "赤・緑・白の点滅灯を見る", "低いエンジン音や一定速度の移動を確認する"],
    commonAppearance: ["点滅する光", "三角形の灯火", "近づいてくる白い光"],
    relatedTerms: [
      { type: "term", id: "ifo" },
      { type: "term", id: "misidentification" },
      { type: "term", id: "verification" },
    ],
  },
  {
    id: "drone",
    name: "ドローン",
    englishName: "Drone",
    aliases: ["無人航空機"],
    category: "UFOと誤認",
    kind: "航空機",
    summary: "低空で停止・移動できるため、小型UFOや奇妙な光として見られやすい。",
    quickRead:
      "ドローンは、低空で止まったり急に動いたりできるため、現代のUFO誤認で重要です。LEDの色や夜間飛行で異常な光に見えます。",
    whyItLooksLikeUfo:
      "ホバリング、急停止、上下移動など、飛行機とは違う動きをします。夜間は本体が見えず、LEDだけが空に浮いているように見えるため、近距離の小型UFOに感じられます。",
    howToTell: ["低空で比較的近いか見る", "小さなモーター音を聞く", "同じ範囲でホバリングや往復をしていないか確認する"],
    commonAppearance: ["赤・緑・白のLED", "低空で止まる光", "小刻みに動く光"],
    relatedTerms: [
      { type: "term", id: "uap" },
      { type: "term", id: "misidentification" },
      { type: "term", id: "verification" },
    ],
  },
  {
    id: "satellite",
    name: "人工衛星",
    englishName: "Satellite",
    category: "UFOと誤認",
    kind: "天体",
    summary: "夜空を一定速度で進む光点。音のない高空UFOのように見えることがある。",
    quickRead:
      "人工衛星は、夜空を静かに一定速度で移動する光点として見えます。点滅せず音もないため、飛行機とは違う不思議な物体に見えることがあります。",
    whyItLooksLikeUfo:
      "太陽光を反射して光るため、肉眼では白い点が空を滑るように移動します。突然明るくなったり、地球の影に入って消えたりすると、急に出現・消滅したように見えます。",
    howToTell: ["一定速度で直線移動するか見る", "点滅や音がないか確認する", "衛星予報アプリで通過時刻を確認する"],
    commonAppearance: ["白い点光源", "音のない直線移動", "途中でふっと消える光"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "term", id: "verification" },
      { type: "misidentification", id: "starlink" },
    ],
  },
  {
    id: "starlink",
    name: "スターリンク衛星",
    englishName: "Starlink Satellites",
    category: "UFOと誤認",
    kind: "天体",
    summary: "打ち上げ直後に光の列として見え、編隊UFOや母船のように誤認されやすい。",
    quickRead:
      "スターリンク衛星は、打ち上げ直後に光の列として夜空を進むことがあります。列車のような光の連なりは、編隊UFOとして驚かれやすい対象です。",
    whyItLooksLikeUfo:
      "複数の光点が一定間隔で並び、同じ方向へ移動します。肉眼では人工物の列に見えるため、巨大な構造物や編隊飛行のように感じられることがあります。",
    howToTell: ["多数の光が同じ間隔で直線移動するか見る", "Starlink通過予報を確認する", "数分で同じ方向へ消えていくか見る"],
    commonAppearance: ["光の列", "空を進む列車状の点", "規則的な編隊"],
    relatedTerms: [
      { type: "misidentification", id: "satellite" },
      { type: "term", id: "ufo-wave" },
      { type: "term", id: "misidentification" },
    ],
  },
  {
    id: "military-flare",
    name: "軍用照明弾",
    englishName: "Military Flare",
    aliases: ["フレア"],
    category: "UFOと誤認",
    kind: "航空機",
    summary: "夜空に明るい光が並び、ゆっくり落下するため、巨大UFOの光に見えることがある。",
    quickRead:
      "軍用照明弾は、夜間訓練などで投下される強い光です。複数並ぶと、空中に止まった巨大物体のライトのように見えることがあります。",
    whyItLooksLikeUfo:
      "明るい光がゆっくり落下し、風に流されながら長く見えます。複数のフレアが横に並ぶと、巨大なV字型や船体のライトのように知覚されることがあります。",
    howToTell: ["軍の演習空域や基地の近くか確認する", "光がゆっくり下がるか見る", "一定時間で燃え尽きるか確認する"],
    commonAppearance: ["明るいオレンジの光", "横に並ぶ光", "ゆっくり沈む点"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "term", id: "verification" },
      { type: "event", id: "phoenix-lights", label: "フェニックス・ライト" },
    ],
  },
  {
    id: "balloon",
    name: "風船",
    englishName: "Balloon",
    category: "UFOと誤認",
    kind: "航空機",
    summary: "風に流される反射物。銀色や丸い形が、低速UFOのように見えることがある。",
    quickRead:
      "風船は、日光を反射して空に浮く小さな点として見えます。高度や距離がわかりにくく、ゆっくり移動するUFOとして誤認されることがあります。",
    whyItLooksLikeUfo:
      "銀色の風船は太陽光で強く光り、形が丸や楕円に見えます。風に流されて不規則に動くため、意図的に移動している物体のように感じられることがあります。",
    howToTell: ["風向きと同じ方向へ流れているか見る", "回転で明るさが変わるか確認する", "高度が上がるにつれて小さくなるか見る"],
    commonAppearance: ["銀色の点", "ゆっくり流れる丸い物体", "光ったり暗くなったりする点"],
    relatedTerms: [
      { type: "term", id: "ifo" },
      { type: "term", id: "misidentification" },
      { type: "term", id: "verification" },
    ],
  },
  {
    id: "weather-balloon",
    name: "気象観測気球",
    englishName: "Weather Balloon",
    category: "UFOと誤認",
    kind: "航空機",
    summary: "高高度へ上がる大型気球。白い球体や奇妙な高空物体として見えることがある。",
    quickRead:
      "気象観測気球は、高高度で白く膨らんだ球体として見えることがあります。距離感がつかみにくく、巨大な静止UFOのように見える場合があります。",
    whyItLooksLikeUfo:
      "非常に高い場所で太陽光を受け、白く明るく見えます。地上からは大きさや高度が判断しにくく、ほとんど止まっている巨大物体に感じられることがあります。",
    howToTell: ["気象台や観測機関の放球時刻を確認する", "風に沿ってゆっくり流れるか見る", "双眼鏡で球体や吊り下げ物が見えるか確認する"],
    commonAppearance: ["白い球体", "高空で止まる点", "ゆっくり流れる明るい物体"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "term", id: "ifo" },
      { type: "term", id: "project-blue-book" },
    ],
  },
  {
    id: "sky-lantern",
    name: "スカイランタン",
    englishName: "Sky Lantern",
    category: "UFOと誤認",
    kind: "航空機",
    summary: "炎で浮かぶランタン。夜空を漂うオレンジ色の光としてUFOに見える。",
    quickRead:
      "スカイランタンは、紙のランタンが熱気で浮かぶものです。夜空をオレンジ色の光がゆっくり移動するため、編隊UFOや火の玉として見られます。",
    whyItLooksLikeUfo:
      "複数同時に上がると、規則性のない光の群れに見えます。音がなく、ゆっくり高度を上げたり風で流れたりするため、意思を持つ光体に感じられることがあります。",
    howToTell: ["オレンジ色でゆっくり風に流れるか見る", "イベントや祭りの時間帯か確認する", "高度が上がるにつれて暗くなるか見る"],
    commonAppearance: ["オレンジの光", "ゆっくり上がる火の玉", "複数の光の群れ"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "misidentification", id: "fireball" },
      { type: "term", id: "ufo-wave" },
    ],
  },
  {
    id: "bird",
    name: "鳥",
    englishName: "Bird",
    category: "UFOと誤認",
    kind: "生物",
    summary: "遠距離や映像では、鳥の群れや反射が高速物体・編隊UFOに見えることがある。",
    quickRead:
      "鳥は、肉眼や映像でUFOのように見えることがあります。遠くの鳥、白い鳥、群れ、カメラ近くを横切る鳥は、速度や大きさを誤認しやすい対象です。",
    whyItLooksLikeUfo:
      "距離がわからないと、小さな鳥が遠くの高速物体に見えます。羽ばたきが映像のフレーム数と合わないと、点滅や形状変化のように見えることもあります。",
    howToTell: ["羽ばたきや群れの動きを確認する", "背景に対する速度と距離感を見直す", "同じ地域の鳥の飛行パターンを考える"],
    commonAppearance: ["黒い点", "白く光る点", "群れの編隊"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "misidentification", id: "parallax" },
      { type: "term", id: "verification" },
    ],
  },
  {
    id: "insect",
    name: "虫",
    englishName: "Insect",
    category: "UFOと誤認",
    kind: "生物",
    summary: "カメラ近くを横切る虫が、映像では高速UFOや棒状物体に見えることがある。",
    quickRead:
      "虫は、カメラの近くを横切ると非常に速い物体のように映ります。ピントが合わず、棒状や光の筋として見えることがあります。",
    whyItLooksLikeUfo:
      "カメラに近い小さな虫は、背景と比べて高速で移動しているように見えます。露光やモーションブラーにより、棒状、線状、透明な物体のように映ることがあります。",
    howToTell: ["カメラ近くでピントが合っていないか見る", "同じ場所で虫が飛ぶ環境か確認する", "背景との距離差による速度錯覚を考える"],
    commonAppearance: ["高速の線", "棒状の影", "ぼやけた小さな物体"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "misidentification", id: "bokeh" },
      { type: "misidentification", id: "parallax" },
    ],
  },
  {
    id: "lens-flare",
    name: "レンズフレア",
    englishName: "Lens Flare",
    category: "UFOと誤認",
    kind: "カメラ由来",
    summary: "強い光がレンズ内で反射して生じる像。写真や動画で謎の光体に見える。",
    quickRead:
      "レンズフレアは、太陽や強いライトがレンズ内で反射してできる光です。画面内に謎の球体や円盤のような光が現れ、UFO写真として誤解されることがあります。",
    whyItLooksLikeUfo:
      "実際の空にはない光の像が、画面上にだけ現れます。カメラを動かすと光も連動して動くため、飛行物体のように見えることがあります。",
    howToTell: ["太陽や強い光源の反対側に出ていないか見る", "カメラの動きと完全に連動するか確認する", "肉眼では見えたか確認する"],
    commonAppearance: ["丸い光", "緑や紫の点", "半透明の円盤"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "term", id: "verification" },
      { type: "misidentification", id: "reflection" },
    ],
  },
  {
    id: "bokeh",
    name: "ボケ / Bokeh",
    englishName: "Bokeh",
    aliases: ["ピンぼけ"],
    category: "UFOと誤認",
    kind: "カメラ由来",
    summary: "ピント外の点光源が大きな円や多角形に写り、円盤や球体のように見える現象。",
    quickRead:
      "ボケは、ピントが合っていない光が大きな円や多角形に写る現象です。星、飛行機、ドローン、街灯が巨大な球体UFOのように見えることがあります。",
    whyItLooksLikeUfo:
      "カメラが点光源にピントを合わせられないと、光が大きく膨らんで写ります。絞り形状や手ぶれで、六角形、円盤、ドーナツ状に見えることがあります。",
    howToTell: ["ピントが合うと小さな点に戻るか確認する", "ズームやフォーカス変更で形が変わるか見る", "他の点光源も同じ形に写るか確認する"],
    commonAppearance: ["大きな光の円", "多角形の光", "ドーナツ状の球体"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "misidentification", id: "lens-flare" },
      { type: "term", id: "verification" },
    ],
  },
  {
    id: "reflection",
    name: "反射",
    englishName: "Reflection",
    category: "UFOと誤認",
    kind: "カメラ由来",
    summary: "光が物体やレンズ、車体などで跳ね返り、空中の光体のように見えることがある。",
    quickRead:
      "反射は、太陽、街灯、車のライトなどが別の面で跳ね返って見える現象です。空にある物体ではなく、近くの反射光がUFOに見えることがあります。",
    whyItLooksLikeUfo:
      "反射光は、見る角度やカメラ位置によって急に現れたり消えたりします。遠くの空に重なって見えると、空中に浮かぶ光体のように錯覚されます。",
    howToTell: ["視点を変えると位置が変わるか確認する", "近くに光沢面や水面がないか見る", "光源と反射面の位置関係を確認する"],
    commonAppearance: ["突然現れる光", "空に重なる白い点", "移動に連動する光"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "misidentification", id: "lens-flare" },
      { type: "misidentification", id: "window-reflection" },
    ],
  },
  {
    id: "window-reflection",
    name: "窓ガラスの映り込み",
    englishName: "Window Reflection",
    category: "UFOと誤認",
    kind: "カメラ由来",
    summary: "室内灯やスマホ画面が窓に映り、外の空に浮かぶUFOのように見える。",
    quickRead:
      "窓ガラスの映り込みは、室内の照明や物体がガラスに反射して外の景色と重なる現象です。夜景や飛行機内からの撮影でよくUFOに見えます。",
    whyItLooksLikeUfo:
      "外の景色と室内の反射が同じ画面に重なり、空中に謎の光や形が浮かんでいるように見えます。撮影者が肉眼で見ていないものが、写真だけに写ることがあります。",
    howToTell: ["室内の照明や画面を消して再撮影する", "カメラ位置を変えると光が一緒に動くか見る", "窓越し撮影か確認する"],
    commonAppearance: ["室内灯のような丸い光", "四角い画面反射", "空に浮かぶ複数の光"],
    relatedTerms: [
      { type: "misidentification", id: "reflection" },
      { type: "misidentification", id: "lens-flare" },
      { type: "term", id: "misidentification" },
    ],
  },
  {
    id: "parallax",
    name: "パララックス",
    englishName: "Parallax",
    aliases: ["視差"],
    category: "UFOと誤認",
    kind: "錯覚",
    summary: "観察者やカメラの動きで、近くの物体が遠方を高速移動するように見える錯覚。",
    quickRead:
      "パララックスは、見る側が動くことで近くの物体が背景に対して大きく動いて見える現象です。鳥、虫、気球などが高速UFOのように見える原因になります。",
    whyItLooksLikeUfo:
      "遠くの山や雲を背景に、近くの小さな物体が横切ると、非常に高速で移動しているように見えます。これは観察者やカメラ自体が動いている、または近い物体ほど視界の中での見かけの移動量が大きくなるためで、遠くの背景に対する相対的な動きの差（視差）が「高速で飛ぶ未知の物体」という印象を生みます。映像では距離がわかりにくいため、速度や大きさの判断を誤りやすくなります。",
    howToTell: ["カメラや観察者が移動していないか確認する", "背景との距離差を考える", "対象の実際の距離が近い可能性を見る"],
    commonAppearance: ["高速で横切る点", "背景に対して滑る物体", "急加速して見える影"],
    relatedTerms: [
      { type: "term", id: "misidentification" },
      { type: "term", id: "verification" },
      { type: "misidentification", id: "bird" },
      { type: "misidentification", id: "insect" },
    ],
  },
];
