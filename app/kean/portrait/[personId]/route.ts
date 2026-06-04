import { peopleById } from "@/data/kean/people";

type RouteContext = {
  params: { personId: string } | Promise<{ personId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { personId } = await Promise.resolve(params);
  const normalizedPersonId = personId.endsWith(".svg") ? personId.slice(0, -4) : personId;
  const person = peopleById.get(normalizedPersonId);

  if (!person) {
    return new Response("Not found", { status: 404 });
  }

  return Response.redirect(
    new URL(`/kean/images/people/illustrations/${person.id}.png`, _.url),
    308,
  );
}
