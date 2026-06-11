import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  globalIgnores([".next/**", "node_modules/**", "out/**"]),
  nextCoreWebVitals,
  nextTypescript,
  {
    rules: {
      // Pre-existing issues in large client components (RuppeltBrowser, Kinichi*,
      // OhtsukiChecker). Keep visible as warnings until those components are split.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
]);
