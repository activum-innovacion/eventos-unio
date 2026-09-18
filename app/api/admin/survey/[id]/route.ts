import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteSurveyResponse } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const ok = await deleteSurveyResponse(id);
  if (!ok) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
