import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { addCandidate, getAllCandidates } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ candidates: await getAllCandidates() });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 });
  }
  const data = body as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (title.length < 2)
    return NextResponse.json({ error: "El título es obligatorio." }, { status: 400 });
  const genre = typeof data.genre === "string" ? data.genre.trim() : "";
  const synopsis = typeof data.synopsis === "string" ? data.synopsis.trim() : "";
  const imageUrl =
    typeof data.imageUrl === "string" && data.imageUrl.trim()
      ? data.imageUrl.trim()
      : undefined;
  const year =
    data.year === undefined || data.year === "" ? undefined : Number(data.year);

  // El admin crea candidatas ya aprobadas.
  const candidate = await addCandidate(
    { title, genre, synopsis, year, imageUrl },
    new Date().toISOString(),
    "approved"
  );
  return NextResponse.json({ candidate }, { status: 201 });
}
