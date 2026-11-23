import type { Metadata } from "next";
import pursueIndex from "@/data/pursue/pursue-records.json";
import type { PursueIndex } from "@/lib/pursue";
import { RuppeltVideoViewer } from "./RuppeltVideoViewer";

export const metadata: Metadata = {
  title: "PURSUE動画ビューアー138件 | Ruppelt V5.5",
  description: "PURSUE Release 01〜08で公開されたUAP関連動画138件を、スマホで連続して確認できます。",
  alternates: { canonical: "/ruppelt/videos" },
};

export default function RuppeltVideosPage() {
  const index = pursueIndex as PursueIndex;
  const videos = index.records.filter((record) => record.source.documentType === "VID");

  return <RuppeltVideoViewer records={videos} />;
}
