import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { approveCandidate } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const candidate = await approveCandidate(id);
  if (!candidate)
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ candidate });
}
