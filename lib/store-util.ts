import crypto from "crypto";

/** Paletas para el póster placeholder (cuando la película no tiene imagen). */
export const POSTER_PALETTE: Array<{ from: string; to: string }> = [
  { from: "#2563eb", to: "#db2777" },
  { from: "#0d9488", to: "#eab308" },
  { from: "#7c3aed", to: "#f97316" },
  { from: "#e11d48", to: "#4f46e5" },
  { from: "#0891b2", to: "#a78bfa" },
  { from: "#b45309", to: "#facc15" },
];

export function pickPalette(): { from: string; to: string } {
  const i = crypto.randomInt(POSTER_PALETTE.length);
  return POSTER_PALETTE[i];
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

/** Id único con sufijo aleatorio: p. ej. "scr-coco-9f3a1c22". */
export function genId(prefix: string, title: string): string {
  const base = slugify(title) || "item";
  return `${prefix}-${base}-${crypto.randomBytes(4).toString("hex")}`;
}
