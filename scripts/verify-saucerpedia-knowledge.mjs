import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { validateSaucerpediaKnowledge } = await jiti.import("../data/saucerpedia/knowledge.ts");

const errors = validateSaucerpediaKnowledge();

if (errors.length) {
  console.error(`Saucerpedia knowledge validation failed: ${errors.length} unresolved relation(s)`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Saucerpedia knowledge validation passed.");
