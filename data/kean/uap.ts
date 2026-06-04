export type KeanUapRecord = {
  id: "tic-tac" | "gimbal" | "gofast";
  name: string;
  jaName: string;
  yearLabel: string;
  shortSummary: string;
  whatIsShown: string;
  verifiedFacts: string[];
  discussionPoints: string[];
  cautions: string[];
  videoLabel: string;
  officialVideoUrl: string;
  sourceLinks: {
    label: string;
    url: string;
  }[];
  model?: {
    src: string;
    label: string;
  };
};

const dodRelease = {
  label: "DoD - 2020 Historical Navy Videos release",
  url: "https://www.defense.gov/News/Releases/release/article/2165713/statement-by-the-department-of-defense-on-the-release-of-historical-navy-videos/",
};

const navairReadingRoom = {
  label: "NAVAIR FOIA Reading Room",
  url: "https://www.navair.navy.mil/foia/documents",
};

export const keanUapRecords: KeanUapRecord[] = [
  {
    id: "tic-tac",
    name: "Tic Tac",
    jaName: "Tic Tac",
    yearLabel: "2004",
    shortSummary: "ニミッツ空母打撃群の文脈で知られる、白いカプセル状の物体に関する代表的なUAP事例。",
    whatIsShown:
      "公開映像では、米海軍機の赤外線センサー映像に小さな目標が映り、画面内で追尾されます。映像だけで物体の正体や距離、速度を確定することはできません。",
    verifiedFacts: [
      "DoDは2020年、2004年11月に撮影された1本を含む海軍動画3本の公開を承認した。",
      "DoDは、公開された映像に映る現象を unidentified と表現している。",
      "ニミッツ号Tic Tac事件は、デイヴィッド・フレーバーらの証言とともに現代UAP史で繰り返し参照されている。",
    ],
    discussionPoints: [
      "映像、パイロット証言、レーダー記録、後年の分析をどこまで接続して読むか。",
      "公開映像だけで、距離、サイズ、速度、運動性能をどこまで推定できるか。",
    ],
    cautions: [
      "公式公開は映像の来歴を認めるもので、非人間由来や特定の正体を認めるものではない。",
      "Tic Tacという呼称は目撃証言上の形状表現であり、映像上の全情報を説明する名称ではない。",
    ],
    videoLabel: "NAVAIR公開動画: 1 - FLIR.mp4",
    officialVideoUrl: "https://www.navair.navy.mil/foia/sites/g/files/jejdrs566/files/2020-04/1%20-%20FLIR.mp4",
    sourceLinks: [dodRelease, navairReadingRoom],
    model: {
      src: "/kean/models/tictac/tic_tac_uap_ufo_with_warp_bubble.glb",
      label: "Tic Tac 3D model",
    },
  },
  {
    id: "gimbal",
    name: "Gimbal",
    jaName: "Gimbal",
    yearLabel: "2015",
    shortSummary: "東海岸沖の海軍機センサー映像として知られ、回転して見える赤外線目標をめぐり議論が続くUAP動画。",
    whatIsShown:
      "公開映像では、赤外線映像の中で明るい目標が画面中央付近に捉えられ、回転するように見える場面があります。",
    verifiedFacts: [
      "DoDは2020年、2015年1月に撮影された2本のうち1本としてGimbal動画の公開を承認した。",
      "NAVAIR FOIA Reading RoomにはGIMBALの公開項目がある。",
      "DoDは、公開された映像に映る現象を unidentified と表現している。",
    ],
    discussionPoints: [
      "画面上の回転が物体自体の回転なのか、センサーや光学系の見え方なのか。",
      "音声、センサー表示、当時の運用文脈をどこまで映像解釈に使えるか。",
    ],
    cautions: [
      "動画の印象だけで運動性能や正体を断定しない。",
      "懐疑分析と証言は、どちらも映像だけでは補えない前提を含むことがある。",
    ],
    videoLabel: "NAVAIR公開動画: 2 - GIMBAL.wmv",
    officialVideoUrl: "https://www.navair.navy.mil/foia/sites/g/files/jejdrs566/files/2020-04/2%20-%20GIMBAL.wmv",
    sourceLinks: [dodRelease, navairReadingRoom],
  },
  {
    id: "gofast",
    name: "GoFast",
    jaName: "GoFast",
    yearLabel: "2015",
    shortSummary: "海面近くを高速移動しているように見えることで知られるが、速度や高度の解釈が議論されるUAP動画。",
    whatIsShown:
      "公開映像では、海面を背景に小さな目標がセンサーで捕捉され、画面上では速く移動しているように見えます。",
    verifiedFacts: [
      "DoDは2020年、2015年1月に撮影された2本のうち1本としてGoFast動画の公開を承認した。",
      "NAVAIR FOIA Reading RoomにはGOFASTの公開項目がある。",
      "DoDは、公開された映像に映る現象を unidentified と表現している。",
    ],
    discussionPoints: [
      "画面上の見かけの速さと、実際の対象速度をどう分けて考えるか。",
      "高度、角度、風、センサー表示を使った再計算で、どこまで説明可能か。",
    ],
    cautions: [
      "GoFastという名称は見かけの印象を含むため、実速度をそのまま表すとは限らない。",
      "映像単体では、物体の種類や高度を確定できない。",
    ],
    videoLabel: "NAVAIR公開動画: 3 - GOFAST.wmv",
    officialVideoUrl: "https://www.navair.navy.mil/foia/sites/g/files/jejdrs566/files/2020-04/3%20-%20GOFAST.wmv",
    sourceLinks: [dodRelease, navairReadingRoom],
  },
];

export const keanUapById = new Map<string, KeanUapRecord>(keanUapRecords.map((record) => [record.id, record]));
