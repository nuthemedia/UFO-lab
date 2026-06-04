import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const peoplePath = path.join(root, "data/kean/people.ts");
const portraitPath = path.join(root, "lib/keanPortrait.ts");
const illustrationDir = path.join(root, "public/kean/images/people/illustrations");

const peopleSource = fs.readFileSync(peoplePath, "utf8");
const portraitSource = fs.readFileSync(portraitPath, "utf8");

if (!portraitSource.includes("const sourcePath = `/kean/images/people/illustrations/${person.id}.png`")) {
  throw new Error("Kean portrait helper does not map ids to /kean/images/people/illustrations/{personId}.png");
}

if (!peopleSource.includes("illustration: makeKeanPortraitAsset({ id, name, jaName, category })")) {
  throw new Error("Kean people helper is not assigning the generated illustration asset");
}

const personIds = [...peopleSource.matchAll(/person\("([^"]+)"/g)].map((match) => match[1]);
const uniquePersonIds = new Set(personIds);

if (personIds.length !== uniquePersonIds.size) {
  throw new Error("Duplicate person ids found in data/kean/people.ts");
}

const legacyPortraitMatches = peopleSource.match(/portrait:\s*portraits\.[A-Za-z0-9_]+/g) ?? [];

for (const personId of personIds) {
  const expectedFile = path.join(illustrationDir, `${personId}.png`);

  if (!fs.existsSync(expectedFile)) {
    throw new Error(`Missing Kean portrait PNG for ${personId}`);
  }
}

console.log(
  `Kean portrait audit passed: ${personIds.length} people, ${legacyPortraitMatches.length} legacy photos retained, static generated PNG illustrations are consistent.`,
);
