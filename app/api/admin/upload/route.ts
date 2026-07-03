import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Se esperaba un formulario con la imagen." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta la imagen." }, { status: 400 });
  }
  const ext = EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Formato no admitido (usa JPG, PNG, WEBP, GIF o AVIF)." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen es demasiado grande (máx. 6 MB)." },
      { status: 400 }
    );
  }

  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;

  // 1) Producción: Vercel Blob (si está configurado el token).
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`carteles/${name}`, file, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    } catch (e) {
      console.error("[upload] Vercel Blob error:", e);
      const detail = e instanceof Error ? e.message : "error desconocido";
      return NextResponse.json(
        { error: `No se pudo subir a Blob: ${detail}` },
        { status: 502 }
      );
    }
  }

  // 2) Local: guardar en public/uploads.
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), bytes);
  } catch {
    return NextResponse.json(
      {
        error:
          "No se pudo guardar la imagen: este entorno no permite escribir en disco y no hay almacenamiento configurado. Añade Vercel Blob (variable BLOB_READ_WRITE_TOKEN).",
      },
      { status: 501 }
    );
  }

  return NextResponse.json({ url: `/uploads/${name}` }, { status: 201 });
}
