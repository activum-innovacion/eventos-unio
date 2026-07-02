"use client";

import { useState } from "react";
import type { CandidateView } from "@/lib/types";
import { ImageUpload } from "./ImageUpload";

const GENRES = [
  "Animación · Familiar",
  "Comedia",
  "Aventura",
  "Acción",
  "Ciencia ficción",
  "Drama",
  "Romance",
  "Musical",
  "Terror",
  "Thriller",
  "Documental",
  "Clásico",
];

const input =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-indigo focus:ring-2 focus:ring-indigo/15";
const label = "mb-1 block text-[0.7rem] font-bold uppercase tracking-wide text-muted";

export function CandidateForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: CandidateView;
  onSaved: (c: CandidateView) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [year, setYear] = useState(initial?.year ? String(initial.year) : "");
  const [genre, setGenre] = useState(initial?.genre ?? GENRES[0]);
  const [synopsis, setSynopsis] = useState(initial?.synopsis ?? "");
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    initial?.imageUrl
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = { title, year, genre, synopsis, imageUrl: imageUrl ?? "" };
    const url = initial
      ? `/api/admin/candidates/${initial.id}`
      : "/api/admin/candidates";
    const method = initial ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar.");
        setSaving(false);
        return;
      }
      onSaved(data.candidate);
    } catch {
      setError("Error de conexión.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-indigo/30 bg-card p-4 shadow-sm"
    >
      <h3 className="text-sm font-bold text-ink">
        {initial ? "Editar película" : "Nueva candidata"}
      </h3>

      <div>
        <label className={label}>Título *</label>
        <input
          className={input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Regreso al futuro"
          required
        />
      </div>

      <div className="flex gap-3">
        <div className="w-24">
          <label className={label}>Año</label>
          <input
            className={input}
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="1985"
          />
        </div>
        <div className="flex-1">
          <label className={label}>Género</label>
          <select
            className={input}
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            {[...new Set([genre, ...GENRES])].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Sinopsis</label>
        <textarea
          className={`${input} resize-none`}
          rows={3}
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
        />
      </div>

      <div>
        <label className={label}>Cartel / imagen</label>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
      </div>

      {error && <p className="text-sm text-coral">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo px-4 py-2 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-50"
        >
          {saving ? "Guardando…" : initial ? "Guardar cambios" : "Añadir"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
