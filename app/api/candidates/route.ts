import { NextRequest, NextResponse } from "next/server";
import { getCandidates } from "@/lib/store";

export const dynamic = "force-dynamic";

// Lista pública de películas votables (definidas por el admin).
// Las propuestas de residentes se retiraron: solo se crean desde el panel.
export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("deviceId") ?? undefined;
  const candidates = await getCandidates(deviceId);
  return NextResponse.json({ candidates });
}
