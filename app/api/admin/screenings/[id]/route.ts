import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  deleteScreening,
  updateScreening,
  type ScreeningInput,
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
  const patch: Partial<ScreeningInput> = {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : undefined);

  if (str(data.title) !== undefined) patch.title = str(data.title);
  if (str(data.genre) !== undefined) patch.genre = str(data.genre);
  if (str(data.synopsis) !== undefined) patch.synopsis = str(data.synopsis);
  if (str(data.location) !== undefined) patch.location = str(data.location);
  if (str(data.rating) !== undefined) patch.rating = str(data.rating);
  if (str(data.date) !== undefined) patch.date = str(data.date);
  if (str(data.time) !== undefined) patch.time = str(data.time);
  if ("imageUrl" in data) patch.imageUrl = str(data.imageUrl) || undefined;
  if ("pendingVote" in data) patch.pendingVote = Boolean(data.pendingVote);
  if (data.year !== undefined && data.year !== "") patch.year = Number(data.year);
  if (data.duration !== undefined && data.duration !== "")
    patch.duration = Number(data.duration);

  const screening = await updateScreening(id, patch);
  if (!screening)
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ screening });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const ok = await deleteScreening(id);
  if (!ok) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
