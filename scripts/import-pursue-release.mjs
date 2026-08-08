import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const releaseDefinitions = [
  {
    id: "release_05",
    date: "8/7/26",
    number: "5",
    matchers: ["8/7", "august 7"],
  },
  {
    id: "release_04",
    date: "7/10/26",
    number: "4",
    matchers: ["7/10", "july 10"],
  },
  {
    id: "release_03",
    date: "6/12/26",
    number: "3",
    matchers: ["6/12", "june 12"],
  },
  {
    id: "release_02",
    date: "5/22/26",
    number: "2",
    matchers: ["5/22", "may 22"],
  },
  {
    id: "release_01",
    date: "5/8/26",
    number: "1",
    matchers: ["5/8", "may 8"],
  },
];

function readArg(name, fallback = "") {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));

  if (inline) {
    return inline.slice(prefix.length);
  }

  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (cell || row.length) {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = "";
      }
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows;
}

function cleanValue(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .replace(/\u00a0/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeHeaderLookup(headers) {
  return new Map(headers.map((header, index) => [cleanValue(header), index]));
}

function getCell(row, headers, name) {
  const index = headers.get(name);
  return index === undefined ? "" : cleanValue(row[index]);
}

function getReleaseId(release) {
  const value = release.toLowerCase();
  return releaseDefinitions.find((item) => item.matchers.some((matcher) => value.includes(matcher)))?.id || "";
}

function getPrimaryUrl(record) {
  return record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl || "";
}

function getRecordKey(record) {
  return `${record.source.assetFileName.toLowerCase()}|${getPrimaryUrl(record).toLowerCase()}`;
}

function makeRecord(row, headers, id) {
  const documentType = getCell(row, headers, "Type");
  const dvidsVideoId = getCell(row, headers, "DVIDS Video ID");
  const fileUrl = getCell(row, headers, "PDF | Image Link");
  const thumbnailUrl = getCell(row, headers, "Modal Image");
  const videoUrl = dvidsVideoId
    ? `https://www.war.gov/Portals/1/Interactive/2026/UFO/${dvidsVideoId}`
    : "";

  return {
    source: {
      id,
      assetFileName: getCell(row, headers, "Title"),
      release: getCell(row, headers, "Release Date"),
      agency: getCell(row, headers, "Agency"),
      incidentDate: getCell(row, headers, "Incident Date"),
      incidentLocation: getCell(row, headers, "Incident Location"),
      documentType,
      description: getCell(row, headers, "Description Blurb"),
      virin: getCell(row, headers, "Image VIRIN"),
      downloadUrl: documentType === "PDF" || documentType === "IMG" ? fileUrl : "",
      imageUrl: thumbnailUrl,
      videoUrl,
    },
    ja: {
      assetFileNameJa: "",
      releaseJa: "",
      agencyJa: "",
      incidentLocationJa: "",
      documentTypeJa: "",
      descriptionJa: "",
    },
  };
}

function escapeCsvCell(value) {
  const text = cleanValue(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function mirrorJsonToCsv(records, releaseDate) {
  const headers = [
    "Title",
    "Release Date",
    "Agency",
    "Incident Date",
    "Incident Location",
    "Type",
    "Description Blurb",
    "Image VIRIN",
    "DVIDS Video ID",
    "PDF | Image Link",
    "Modal Image",
  ];
  const rows = records
    .filter((record) => cleanValue(record.releaseDate) === releaseDate)
    .map((record) => [
      record.title,
      record.releaseDate,
      record.agency,
      record.incidentDate,
      record.incidentLocation,
      record.type,
      record.description,
      "",
      record.dvidsVideoId,
      record.fileUrl,
      record.thumbnailUrl,
    ]);

  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

async function loadCsvText(csvUrl, releaseDate) {
  const mirrorInputPath = readArg("--mirror-input");

  if (mirrorInputPath) {
    const mirrorRecords = JSON.parse(await readFile(resolve(rootDir, mirrorInputPath), "utf8"));
    return mirrorJsonToCsv(mirrorRecords, releaseDate);
  }

  const inputPath = readArg("--input");

  if (inputPath) {
    return readFile(resolve(rootDir, inputPath), "utf8");
  }

  const response = await fetch(csvUrl, {
    headers: {
      accept: "text/csv,*/*;q=0.8",
      referer: "https://www.war.gov/UFO/",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch official PURSUE CSV (${response.status}). If war.gov blocks CLI access, download the CSV in a browser and rerun with --input /path/to/uap-data.csv.`,
    );
  }

  const csvText = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (/^\s*</.test(csvText) || /text\/html/i.test(contentType)) {
    throw new Error(
      "Official PURSUE CSV request returned HTML instead of CSV. Download the CSV in a browser and rerun with --input /path/to/uap-data.csv.",
    );
  }

  return csvText;
}

const requestedReleaseId = cleanValue(readArg("--release-id", "release_05"));
const releaseDefinition = releaseDefinitions.find((item) => item.id === requestedReleaseId);

if (!releaseDefinition) {
  throw new Error(`Unsupported PURSUE release id: ${requestedReleaseId}.`);
}

const releaseDate = cleanValue(readArg("--release-date", releaseDefinition.date));
const defaultCsvUrl = `https://www.war.gov/Portals/1/Interactive/2026/UFO/uap-data.csv?release=${releaseDefinition.number}`;
const csvUrl = readArg("--url", defaultCsvUrl);
const csvText = (await loadCsvText(csvUrl, releaseDate)).replace(/^\uFEFF/, "");
const rows = parseCSV(csvText).filter((row) => row.some((cell) => cleanValue(cell)));
const headers = makeHeaderLookup(rows[0] || []);
const sourceRows = rows.slice(1).filter((row) => getCell(row, headers, "Release Date") === releaseDate);

if (!sourceRows.length) {
  throw new Error(`No PURSUE records found for Release Date ${releaseDate}.`);
}

const index = JSON.parse(await readFile(recordsPath, "utf8"));
const releaseId = getReleaseId(releaseDate);

if (releaseId !== requestedReleaseId) {
  throw new Error(
    `Release date ${releaseDate} resolves to ${releaseId || "no known release"}, not ${requestedReleaseId}.`,
  );
}

const preservedRecords = index.records.filter((record) => record.searchFacets?.releaseId !== releaseId);
const nextNumber =
  Math.max(
    0,
    ...preservedRecords.map((record) => Number(record.source.id.match(/^pursue-(\d+)$/)?.[1] || 0)),
  ) + 1;
const importedRecords = sourceRows.map((row, indexValue) =>
  makeRecord(row, headers, `pursue-${String(nextNumber + indexValue).padStart(4, "0")}`),
);
const existingKeys = new Set(preservedRecords.map(getRecordKey));
const importedKeys = new Set();

for (const record of importedRecords) {
  const key = getRecordKey(record);

  if (existingKeys.has(key) || importedKeys.has(key)) {
    throw new Error(`Duplicate PURSUE record detected: ${record.source.assetFileName}`);
  }

  importedKeys.add(key);
}

const nextIndex = {
  ...index,
  metadata: {
    ...index.metadata,
    sourcePageUrl: "https://www.war.gov/UFO/",
    csvUrl,
    fetchedAt: new Date().toISOString(),
    recordCount: preservedRecords.length + importedRecords.length,
  },
  records: [...preservedRecords, ...importedRecords],
};

await writeFile(recordsPath, `${JSON.stringify(nextIndex, null, 2)}\n`, "utf8");

console.log(`Imported ${importedRecords.length} ${releaseId} records from ${releaseDate}.`);
console.log(`Wrote ${recordsPath}`);
