import sharedDocuments from "@/data/shared/pursue-document-bundles.json";
import fulltextSearchIndex from "@/data/shared/search/fulltext-index.json";

export function GET() {
  return Response.json({
    sharedDocuments,
    fulltextSearchIndex,
  });
}
