import { NextRequest, NextResponse } from "next/server";
import { addSurveyResponse } from "@/lib/store";
import { parseSurveyInput } from "@/lib/survey";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 });
  }

  const input = parseSurveyInput(body);
  if (!input) {
    return NextResponse.json(
      { error: "Respuestas incompletas o no válidas." },
      { status: 400 }
    );
  }

  try {
    const saved = await addSurveyResponse(input);
    return NextResponse.json({ ok: true, id: saved.id });
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar la respuesta." },
      { status: 500 }
    );
  }
}
