import { NextRequest, NextResponse } from "next/server";
import { getScreenings, toggleVote } from "@/lib/store";
import { votingStatus } from "@/lib/voting";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 });
  }

  const deviceId = (body as Record<string, unknown>)?.deviceId;
  if (typeof deviceId !== "string" || deviceId.length < 4) {
    return NextResponse.json(
      { error: "Falta el identificador de dispositivo." },
      { status: 400 }
    );
  }

  // La votación se cierra 3 días antes de la próxima sesión pendiente.
  if (!votingStatus(await getScreenings()).open) {
    return NextResponse.json(
      { error: "La votación está cerrada." },
      { status: 403 }
    );
  }

  const result = await toggleVote(id, deviceId);
  if (!result) {
    return NextResponse.json(
      { error: "Película no encontrada." },
      { status: 404 }
    );
  }
  return NextResponse.json(result);
}
