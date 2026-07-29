import { NextRequest, NextResponse } from "next/server";
import { getCandidates, getScreenings, syncVotesForRound } from "@/lib/store";

export const dynamic = "force-dynamic";

// Lista pública de películas votables (definidas por el admin).
// Las propuestas de residentes se retiraron: solo se crean desde el panel.
export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("deviceId") ?? undefined;
  // Reinicia los votos si ha empezado una nueva ronda de votación.
  await syncVotesForRound(await getScreenings());
  const candidates = await getCandidates(deviceId);
  return NextResponse.json({ candidates });
}
