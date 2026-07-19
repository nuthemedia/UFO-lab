import type { Metadata } from "next";
import {
  getSaucerpediaEntryMetadata,
  getSaucerpediaEntryStaticParams,
  SaucerpediaEntryPage,
} from "../../entryPages";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getSaucerpediaEntryStaticParams("resource");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return getSaucerpediaEntryMetadata("resource", id);
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <SaucerpediaEntryPage id={id} type="resource" />;
}
