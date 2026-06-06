import { existsSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();

const requiredPaths = [
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
];

const missingPaths = requiredPaths.filter((path) => !existsSync(resolve(rootDir, path)));

if (missingPaths.length > 0) {
  console.error("Missing production route files. Refusing to continue:");
  for (const path of missingPaths) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

console.log("Production route files are present.");
