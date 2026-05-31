import { peopleById } from "@/data/kean/people";
import { renderKeanPortraitSvg } from "@/lib/keanPortrait";

type RouteContext = {
  params: { personId: string } | Promise<{ personId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { personId } = await Promise.resolve(params);
  const person = peopleById.get(personId);

  if (!person) {
    return new Response("Not found", { status: 404 });
  }

  const svg = renderKeanPortraitSvg(person);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
