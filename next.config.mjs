import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: projectRoot,
  images: {
    localPatterns: [
      // kean portrait assets carry a ?v= cache-buster (lib/keanPortrait.ts)
      { pathname: "/kean/images/people/illustrations/**", search: "?v=4" },
      { pathname: "/**", search: "" },
    ],
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
