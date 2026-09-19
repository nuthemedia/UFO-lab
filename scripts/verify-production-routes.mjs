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
  "app/saucerpedia/page.tsx",
  "app/saucerpedia/Controls.tsx",
  "app/saucerpedia/DetailCards.tsx",
  "app/saucerpedia/ListCards.tsx",
  "app/saucerpedia/Shell.tsx",
  "app/saucerpedia/SaucerpediaHome.tsx",
  "app/saucerpedia/SaucerpediaBookStackHero.tsx",
  "app/saucerpedia/entryPages.tsx",
  "app/saucerpedia/saucerpedia.module.css",
  "app/saucerpedia/opengraph-image.tsx",
  "app/saucerpedia/seo.ts",
  "app/saucerpedia/terms/page.tsx",
  "app/saucerpedia/terms/[id]/page.tsx",
  "app/saucerpedia/people/page.tsx",
  "app/saucerpedia/people/[id]/page.tsx",
  "app/saucerpedia/events/page.tsx",
  "app/saucerpedia/events/[id]/page.tsx",
  "app/saucerpedia/history/page.tsx",
  "app/saucerpedia/misidentifications/page.tsx",
  "app/saucerpedia/misidentifications/[id]/page.tsx",
  "app/saucerpedia/fakes/page.tsx",
  "app/saucerpedia/fakes/[id]/page.tsx",
  "app/saucerpedia/resources/page.tsx",
  "app/saucerpedia/resources/[id]/page.tsx",
  "app/saucerpedia/motifs/page.tsx",
  "app/saucerpedia/motifs/[id]/page.tsx",
  "app/saucerpedia/search/page.tsx",
  "data/saucerpedia/terms.ts",
  "data/saucerpedia/people.ts",
  "data/saucerpedia/events.ts",
  "data/saucerpedia/history.ts",
  "data/saucerpedia/misidentifications.ts",
  "data/saucerpedia/fakes.ts",
  "data/saucerpedia/resources.ts",
  "data/saucerpedia/motifs.ts",
  "data/saucerpedia/knowledge.ts",
  "data/saucerpedia/types.ts",
  "docs/apps/saucerpedia/AGENTS.md",
  "docs/apps/saucerpedia/PRODUCT.md",
  "docs/apps/saucerpedia/PROJECT.md",
  "docs/apps/saucerpedia/DESIGN.md",
  "docs/apps/saucerpedia/FEATURE.md",
  "docs/apps/saucerpedia/FEATURES.md",
  "docs/apps/saucerpedia/DATA.md",
  "docs/apps/saucerpedia/TERM_CARD.md",
  "docs/apps/saucerpedia/PERSON_CARD.md",
  "docs/apps/saucerpedia/EVENT_CARD.md",
  "docs/apps/saucerpedia/MISIDENTIFICATION_CARD.md",
  "docs/apps/saucerpedia/FAKE_CARD.md",
  "docs/apps/saucerpedia/RESOURCE_CARD.md",
  "docs/apps/saucerpedia/MOTIF_CARD.md",
  "docs/apps/saucerpedia/HISTORY_CARD.md",
  "public/saucerpedia/books/terms.svg",
  "public/saucerpedia/books/people.svg",
  "public/saucerpedia/books/events.svg",
  "public/saucerpedia/books/history.svg",
  "public/saucerpedia/books/misidentifications.svg",
  "public/saucerpedia/books/fakes.svg",
  "public/saucerpedia/books/resources.svg",
  "public/saucerpedia/books/motifs.svg",
  "scripts/verify-saucerpedia-knowledge.mjs",
  "app/cnufohistory/page.tsx",
  "app/cnufohistory/CnUfoHistoryApp.tsx",
  "app/cnufohistory/cnufohistory.module.css",
  "data/cnufohistory/timeline.ts",
  "docs/apps/cnufohistory/AGENTS.md",
  "docs/apps/cnufohistory/PROJECT.md",
  "docs/apps/cnufohistory/DESIGN.md",
  "docs/apps/cnufohistory/FEATURES.md",
  "docs/apps/cnufohistory/DATA.md",
  "public/cnufohistory/cover.png",
  "public/cnufohistory/x-card.png",
  "public/cnufohistory/visuals/renminribao-ufo.png",
  "app/clark/page.tsx",
  "app/clark/opengraph-image.tsx",
  "app/clark/[slug]/page.tsx",
  "app/clark/[slug]/opengraph-image.tsx",
  "components/ClarkAmbientVideo.tsx",
  "components/ClarkArnoldMotionScene.tsx",
  "components/ClarkCaseCard.tsx",
  "components/ClarkCaseExperience.tsx",
  "components/ClarkCasePage.tsx",
  "components/ClarkFooter.tsx",
  "components/ClarkKennethMobileExperience.tsx",
  "components/ClarkModelViewer.tsx",
  "components/ClarkScrollMotion.tsx",
  "components/ClarkSightingWaveChart.tsx",
  "components/clark.module.css",
  "data/clark/cases.ts",
  "docs/apps/clark/AGENTS.md",
  "docs/apps/clark/PROJECT.md",
  "docs/apps/clark/DESIGN.md",
  "docs/apps/clark/FEATURES.md",
  "docs/apps/clark/DATA.md",
  "public/clark/posters/kenneth-arnold-poster.svg",
  "public/clark/video-posters/kenneth-arnold-video-poster.png",
  "public/clark/videos/kenneth-arnold-desktop.mp4",
  "public/clark/images/kenneth-rainier.jpg",
  "public/clark/images/kenneth-arnold-press.jpg",
  "public/clark/images/kenneth-philosophy-card.jpg",
  "public/clark/images/kenneth-flying-saucer-booklet.jpg",
  "public/models/saucers/kenneth-arnold.glb",
  "app/drake/page.tsx",
  "app/drake/opengraph-image.tsx",
  "components/drake/DrakeApp.tsx",
  "components/drake/DrakeApp.module.css",
  "components/drake/DrakeStarField.tsx",
  "data/drake/defaults.ts",
  "docs/apps/drake/AGENTS.md",
  "docs/apps/drake/PROJECT.md",
  "docs/apps/drake/DESIGN.md",
  "docs/apps/drake/FEATURES.md",
  "docs/apps/drake/DATA.md",
  "lib/drakeMath.ts",
  "lib/drakeMath.test.ts",
  "public/drake/earth-horizon.png",
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
  "app/kean/KeanHistory.tsx",
  "app/kean/KeanPageHeader.tsx",
  "app/kean/KeanPeopleIndex.tsx",
  "app/kean/KeanPersonDetail.tsx",
  "app/kean/KeanTicTacModelViewer.tsx",
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
  "app/jenny/page.tsx",
  "app/jenny/opengraph-image.tsx",
  "app/jenny/JennyApp.tsx",
  "app/jenny/jenny.module.css",
  "app/api/jenny/analyze/route.ts",
  "data/jenny/questions.ts",
  "data/jenny/signals.ts",
  "data/jenny/calibration-cases.json",
  "lib/jenny/jev.ts",
  "lib/jenny/quota.ts",
  "lib/jenny/transform.ts",
  "lib/jenny/types.ts",
  "docs/apps/jenny/AGENTS.md",
  "docs/apps/jenny/PROJECT.md",
  "docs/apps/jenny/DESIGN.md",
  "docs/apps/jenny/FEATURES.md",
  "docs/apps/jenny/DATA.md",
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
  "app/ruppelt/videos/page.tsx",
  "app/ruppelt/videos/RuppeltVideoViewer.tsx",
  "app/ruppelt/lp/page.tsx",
  "app/api/ruppelt/fulltext-search/route.ts",
  "app/api/ruppelt/document/[recordId]/route.ts",
  "app/ruppelt/RuppeltBrowser.tsx",
  "app/ruppelt/RuppeltLpMotion.tsx",
  "lib/pursue.ts",
  "data/pursue/pursue-records.json",
  "data/pursue/release06-import-audit.json",
  "data/pursue/release06-ocr-audit.json",
  "data/pursue/release06-ocr-import-audit.json",
  "data/pursue/release06-prior-disclosure-audit.json",
  "data/shared/pursue-document-bundles.json",
  "data/shared/search/fulltext-index.json",
  "public/ogp-ruppelt-v2.jpg",
  "public/ogp-ruppelt-v22.jpg",
  "public/ogp-ruppelt-v25.jpg",
  "public/ogp-ruppelt-v30.jpg",
  "public/ogp-ruppelt-v40.jpg",
  "public/ogp-ruppelt-v45.jpg",
  "docs/apps/ruppelt/AGENTS.md",
  "docs/apps/ruppelt/PROJECT.md",
  "docs/apps/ruppelt/DESIGN.md",
  "docs/apps/ruppelt/FEATURES.md",
  "docs/apps/ruppelt/DATA.md",
];

const requiredDirectoryMinimums = [
  ["data/shared/translations/ja", 250],
  ["data/shared/pursue-documents", 220],
];

const requiredBrandHomeHrefs = [
  "/kean",
  "/kinichi",
  "/keyhoe",
  "/hynek",
  "/hynek/dashboard",
  "/ruppelt",
  "/drake",
  "/saucerpedia",
  "/clark",
  "/cnufohistory",
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
  ["app/ruppelt/page.tsx", "Ruppelt V4.5"],
  ["app/ruppelt/page.tsx", "ogp-ruppelt-v45.jpg"],
  ["app/ruppelt/lp/page.tsx", "Ruppelt V4.5"],
  ["app/ruppelt/lp/page.tsx", "ogp-ruppelt-v45.jpg"],
  ["app/ruppelt/videos/page.tsx", "Ruppelt V4.5"],
  ["data/pursue/pursue-records.json", '"recordCount": 446'],
  ["lib/brandHomeContent.ts", "Ruppelt V4.5"],
  ["app/sitemap.ts", "/ruppelt/videos"],
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
const cacheBustedRuppeltOgpHash = ogpImageHash("public/ogp-ruppelt-v22.jpg");
const v25RuppeltOgpHash = ogpImageHash("public/ogp-ruppelt-v25.jpg");
const v30RuppeltOgpHash = ogpImageHash("public/ogp-ruppelt-v30.jpg");
const v40RuppeltOgpHash = ogpImageHash("public/ogp-ruppelt-v40.jpg");
const v45RuppeltOgpHash = ogpImageHash("public/ogp-ruppelt-v45.jpg");

if (
  legacyRuppeltOgpHash !== versionedRuppeltOgpHash ||
  versionedRuppeltOgpHash !== cacheBustedRuppeltOgpHash ||
  cacheBustedRuppeltOgpHash !== v25RuppeltOgpHash ||
  v25RuppeltOgpHash !== v30RuppeltOgpHash ||
  v30RuppeltOgpHash !== v40RuppeltOgpHash ||
  v40RuppeltOgpHash !== v45RuppeltOgpHash
) {
  console.error("Ruppelt OGP images do not match. Refusing to continue:");
  console.error(
    "- all versioned and legacy Ruppelt OGP images through public/ogp-ruppelt-v45.jpg must match",
  );
  process.exit(1);
}

console.log("Production route files are present.");
