import { NextRequest, NextResponse } from "next/server";
import { addCandidate, getCandidates } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("deviceId") ?? undefined;
  const candidates = await getCandidates(deviceId);
  return NextResponse.json({ candidates });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const genre = typeof data.genre === "string" ? data.genre.trim() : "";
  const synopsis =
    typeof data.synopsis === "string" ? data.synopsis.trim() : "";
  const proposedBy =
    typeof data.proposedBy === "string" ? data.proposedBy.trim() : "";
  const yearRaw = data.year;
  const year =
    typeof yearRaw === "number"
      ? yearRaw
      : typeof yearRaw === "string" && yearRaw.trim() !== ""
        ? Number(yearRaw)
        : undefined;

  if (title.length < 2) {
    return NextResponse.json(
      { error: "El título es obligatorio (mínimo 2 caracteres)." },
      { status: 400 }
    );
  }
  if (title.length > 80) {
    return NextResponse.json(
      { error: "El título es demasiado largo." },
      { status: 400 }
    );
  }
  if (year !== undefined && (Number.isNaN(year) || year < 1900 || year > 2100)) {
    return NextResponse.json({ error: "Año no válido." }, { status: 400 });
  }

  const candidate = await addCandidate(
    { title, genre, synopsis, year, proposedBy },
    new Date().toISOString()
  );
  return NextResponse.json({ candidate }, { status: 201 });
}
