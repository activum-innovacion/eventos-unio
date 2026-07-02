import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  deleteCandidate,
  updateCandidate,
  type CandidatePatch,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 });
  }
  const data = body as Record<string, unknown>;
  const patch: CandidatePatch = {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : undefined);
  if (str(data.title) !== undefined) patch.title = str(data.title);
  if (str(data.genre) !== undefined) patch.genre = str(data.genre);
  if (str(data.synopsis) !== undefined) patch.synopsis = str(data.synopsis);
  if ("imageUrl" in data) patch.imageUrl = str(data.imageUrl) || undefined;
  if (data.year !== undefined && data.year !== "") patch.year = Number(data.year);

  const candidate = await updateCandidate(id, patch);
  if (!candidate)
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ candidate });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const ok = await deleteCandidate(id);
  if (!ok) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
