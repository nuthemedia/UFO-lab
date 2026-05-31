import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const index = JSON.parse(await readFile(recordsPath, "utf8"));

function getDvidsId(record) {
  return record.source.videoUrl.match(/\/(\d+)\/?$/)?.[1] || "";
}

const release02Records = index.records.filter((record) => record.source.release === "5/22/26");

for (const record of release02Records) {
  const dvidsId = getDvidsId(record);
  const officialUrl = record.source.downloadUrl || (dvidsId ? `https://www.dvidshub.net/video/${dvidsId}` : record.source.videoUrl);

  console.log(
    [
      record.source.id,
      record.source.agency,
      record.source.documentType,
      record.source.assetFileName,
      record.source.incidentDate || "N/A",
      record.source.incidentLocation || "N/A",
      dvidsId ? `DVIDS ${dvidsId}` : "no DVIDS",
      officialUrl,
      `"${record.source.assetFileName}" prior public release`,
    ].join("\t"),
  );
}
