"use client";

import Link from "next/link";
import { useState } from "react";

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

type Status = "idle" | "sending" | "done" | "error";

export default function ProponerPage() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [synopsis, setSynopsis] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const canSubmit = title.trim().length >= 2 && status !== "sending";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          genre,
          synopsis: synopsis.trim(),
          proposedBy: name.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "No se pudo enviar la propuesta.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Error de conexión. Inténtalo de nuevo.");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-4 pt-10 text-center animate-in">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-indigo/10 text-4xl">
          🎬
        </div>
        <h1 className="brand-heading text-xl text-ink">¡Propuesta enviada!</h1>
        <p className="max-w-xs text-sm leading-relaxed text-muted">
          Gracias por proponer{" "}
          <span className="font-semibold text-ink">“{title.trim()}”</span>. La
          comisión la revisará y, si se aprueba, aparecerá en las votaciones.
        </p>
        <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setGenre(GENRES[0]);
              setSynopsis("");
              setName("");
              setStatus("idle");
            }}
            className="rounded-xl bg-indigo py-3 text-center text-sm font-bold text-white transition-transform active:scale-95"
          >
            Proponer otra
          </button>
          <Link
            href="/votaciones"
            className="rounded-xl border border-line py-3 text-sm font-semibold text-ink"
          >
            Ir a votaciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="brand-heading text-2xl text-ink">Propón una película</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          ¿Te apetece ver algo en concreto? Añádela y, tras el visto bueno de la
          comisión, el resto de residentes podrán votarla.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título" required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="Ej. Cinema Paradiso"
            className={inputClass}
            autoFocus
          />
        </Field>

        <Field label="Género">
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className={`${inputClass} appearance-none`}
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>

        <Field label="¿De qué va? (opcional)">
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="Una frase para convencer a tus vecinos…"
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="Tu nombre (opcional)">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Para que sepan quién la propuso"
            className={inputClass}
          />
        </Field>

        {status === "error" && (
          <p className="rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-indigo py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "sending" ? "Enviando…" : "Enviar propuesta"}
        </button>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink placeholder:text-muted/70 outline-none transition-colors focus:border-indigo focus:ring-2 focus:ring-indigo/15";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
        {label}
        {required && <span className="text-coral"> *</span>}
      </span>
      {children}
    </label>
  );
}
