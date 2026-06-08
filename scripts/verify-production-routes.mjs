import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();

const requiredPaths = [
  "app/page.tsx",
  "app/en/page.tsx",
  "components/BrandHomePage.tsx",
  "lib/brandHomeContent.ts",
  "public/ogp-brand.jpg",
  "app/jacques/page.tsx",
  "app/jacques/layout.tsx",
  "data/jacques/mockData.ts",
  "public/jacques/vallee-og-card.png",
  "public/jacques/vallee-x-card.png",
  "app/experiments/biorhythm/page.tsx",
  "app/experiments/biorhythm/BiorhythmMachine.tsx",
  "app/experiments/biorhythm/biorhythm.module.css",
  "app/experiments/biorhythm/opengraph-image.tsx",
  "app/kean/page.tsx",
  "app/kean/about/page.tsx",
  "app/kean/history/page.tsx",
  "app/kean/people/page.tsx",
  "app/kean/people/[id]/page.tsx",
  "app/kean/uap/page.tsx",
  "app/kean/uap/[id]/page.tsx",
  "app/kean/portrait/[personId]/route.ts",
  "components/KeanHistory.tsx",
  "components/KeanPageHeader.tsx",
  "components/KeanPeopleIndex.tsx",
  "components/KeanPersonDetail.tsx",
  "components/KeanTicTacModelViewer.tsx",
  "data/kean/guide.ts",
  "data/kean/labels.ts",
  "data/kean/people.ts",
  "data/kean/timeline.ts",
  "data/kean/types.ts",
  "data/kean/uap.ts",
  "docs/apps/kean/AGENTS.md",
  "docs/apps/kean/PROJECT.md",
  "docs/apps/kean/DESIGN.md",
  "docs/apps/kean/FEATURES.md",
  "docs/apps/kean/DATA.md",
  "lib/keanPortrait.ts",
  "public/kean/images/people/illustrations/leslie-kean.png",
  "public/kean/models/tictac/tic_tac_uap_ufo_with_warp_bubble.glb",
  "scripts/verify-kean-portraits.mjs",
  "app/keyhoe/page.tsx",
  "app/keyhoe/about/page.tsx",
  "app/keyhoe/opengraph-image.tsx",
  "public/data/keyhoe-today.json",
  "app/kinichi/page.tsx",
  "app/kinichi/KinichiTopPage.tsx",
  "app/kinichi/KinichiViewer.tsx",
  "app/kinichi/craft/[id]/page.tsx",
  "app/kinichi/shapes/[id]/page.tsx",
  "app/kinichi/kinichi.module.css",
  "app/kinichi/metadata.ts",
  "app/kinichi/opengraph-image.tsx",
  "data/kinichi/catalog.ts",
  "docs/apps/kinichi/AGENTS.md",
  "docs/apps/kinichi/PROJECT.md",
  "docs/apps/kinichi/DESIGN.md",
  "docs/apps/kinichi/FEATURES.md",
  "docs/apps/kinichi/DATA.md",
  "public/kinichi/kinichi-x-card-v1.png",
  "app/ruppelt/page.tsx",
  "app/ruppelt/lp/page.tsx",
  "app/api/ruppelt/fulltext-search/route.ts",
  "app/api/ruppelt/document/[recordId]/route.ts",
  "components/RuppeltBrowser.tsx",
  "components/RuppeltLpMotion.tsx",
  "lib/pursue.ts",
  "data/pursue/pursue-records.json",
  "data/shared/pursue-document-bundles.json",
  "data/shared/search/fulltext-index.json",
  "public/ogp-ruppelt-v2.jpg",
  "docs/apps/ruppelt/AGENTS.md",
  "docs/apps/ruppelt/PROJECT.md",
  "docs/apps/ruppelt/DESIGN.md",
  "docs/apps/ruppelt/FEATURES.md",
  "docs/apps/ruppelt/DATA.md",
];

const requiredDirectoryMinimums = [
  ["data/shared/translations/ja", 100],
  ["data/shared/pursue-documents", 80],
];

const requiredBrandHomeHrefs = [
  "/kean",
  "/kinichi",
  "/keyhoe",
  "/hynek",
  "/hynek/dashboard",
  "/ruppelt",
  "/ohtsuki",
];

const missingPaths = requiredPaths.filter((path) => !existsSync(resolve(rootDir, path)));

if (missingPaths.length > 0) {
  console.error("Missing production route files. Refusing to continue:");
  for (const path of missingPaths) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

const missingDirectories = requiredDirectoryMinimums
  .map(([path, minimum]) => {
    const directoryPath = resolve(rootDir, path);

    if (!existsSync(directoryPath)) {
      return `${path} is missing`;
    }

    const fileCount = readdirSync(directoryPath).filter((fileName) => fileName.endsWith(".json")).length;

    if (fileCount < minimum) {
      return `${path} has ${fileCount} JSON files; expected at least ${minimum}`;
    }

    return "";
  })
  .filter(Boolean);

if (missingDirectories.length > 0) {
  console.error("Missing production data. Refusing to continue:");
  for (const message of missingDirectories) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

const brandHomeContent = readFileSync(resolve(rootDir, "lib/brandHomeContent.ts"), "utf8");
const missingBrandHomeHrefs = requiredBrandHomeHrefs.filter(
  (href) => !brandHomeContent.includes(`href: "${href}"`),
);

if (missingBrandHomeHrefs.length > 0) {
  console.error("Missing brand home product cards. Refusing to continue:");
  for (const href of missingBrandHomeHrefs) {
    console.error(`- ${href}`);
  }
  process.exit(1);
}

const requiredFileContents = [
  ["app/ruppelt/page.tsx", "Ruppelt V2.0"],
  ["app/ruppelt/page.tsx", "ogp-ruppelt-v2.jpg"],
  ["app/ruppelt/lp/page.tsx", "Ruppelt V2.0"],
  ["app/ruppelt/lp/page.tsx", "ogp-ruppelt-v2.jpg"],
];

const missingFileContents = requiredFileContents
  .map(([path, expected]) => {
    const contents = readFileSync(resolve(rootDir, path), "utf8");
    return contents.includes(expected) ? "" : `${path} is missing ${expected}`;
  })
  .filter(Boolean);

if (missingFileContents.length > 0) {
  console.error("Missing production content markers. Refusing to continue:");
  for (const message of missingFileContents) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

const ogpImageHash = (path) =>
  createHash("sha256").update(readFileSync(resolve(rootDir, path))).digest("hex");
const legacyRuppeltOgpHash = ogpImageHash("public/ogp-ruppelt.jpg");
const versionedRuppeltOgpHash = ogpImageHash("public/ogp-ruppelt-v2.jpg");

if (legacyRuppeltOgpHash !== versionedRuppeltOgpHash) {
  console.error("Ruppelt OGP images do not match. Refusing to continue:");
  console.error("- public/ogp-ruppelt.jpg must match public/ogp-ruppelt-v2.jpg");
  process.exit(1);
}

console.log("Production route files are present.");
