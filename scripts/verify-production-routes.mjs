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
