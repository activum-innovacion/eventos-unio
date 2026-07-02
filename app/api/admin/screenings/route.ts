import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { addScreening, getScreenings, type ScreeningInput } from "@/lib/store";

export const dynamic = "force-dynamic";

function parseScreening(data: Record<string, unknown>):
  | { ok: true; value: ScreeningInput }
  | { ok: false; error: string } {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const title = str(data.title);
  const date = str(data.date);
  const time = str(data.time);
  const genre = str(data.genre);
  const synopsis = str(data.synopsis);
  const location = str(data.location) || "Azotea comunitaria";
  const rating = str(data.rating) || "TP";
  const imageUrl = str(data.imageUrl) || undefined;
  const year = Number(data.year) || new Date().getFullYear();
  const duration = Number(data.duration) || 0;

  if (title.length < 2) return { ok: false, error: "El título es obligatorio." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return { ok: false, error: "Fecha no válida (usa el selector)." };
  if (!/^\d{2}:\d{2}$/.test(time))
    return { ok: false, error: "Hora no válida (HH:MM)." };

  return {
    ok: true,
    value: {
      title,
      year,
      genre: genre || "Sin categoría",
      duration,
      rating,
      synopsis,
      date,
      time,
      location,
      imageUrl,
    },
  };
}

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ screenings: await getScreenings() });
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
  const parsed = parseScreening(body as Record<string, unknown>);
  if (!parsed.ok)
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  const screening = await addScreening(parsed.value);
  return NextResponse.json({ screening }, { status: 201 });
}
