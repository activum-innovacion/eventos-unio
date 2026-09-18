"use client";

import { useState } from "react";
import {
  Q1_OPTIONS,
  Q3_OPTIONS,
  Q4_OPTIONS,
  labelFor,
  type SurveyResponse,
} from "@/lib/survey";

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ResponsesLog({
  responses,
}: {
  responses: SurveyResponse[];
}) {
  const [items, setItems] = useState<SurveyResponse[]>(responses);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(r: SurveyResponse) {
    if (
      !confirm(
        `¿Borrar la respuesta registrada el ${fmt(
          r.createdAt
        )}? Esta acción no se puede deshacer.`
      )
    )
      return;
    setBusy(r.id);
    try {
      const res = await fetch(
        `/api/admin/survey/${encodeURIComponent(r.id)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x.id !== r.id));
      } else {
        alert("No se pudo borrar la respuesta.");
      }
    } catch {
      alert("Error de conexión al borrar.");
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">No quedan respuestas registradas.</p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {items.map((r) => (
        <li
          key={r.id}
          className="rounded-xl border border-line bg-cream/50 p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink">🕒 {fmt(r.createdAt)}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                <b>Asistencia:</b> {labelFor(Q1_OPTIONS, r.q1)} ·{" "}
                <b>Valoración:</b>{" "}
                {r.q2 === null ? "No asistió" : `${r.q2}/5`} ·{" "}
                <b>Selección:</b> {labelFor(Q3_OPTIONS, r.q3)}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                <b>Mejoras:</b>{" "}
                {r.q4.length
                  ? r.q4.map((v) => labelFor(Q4_OPTIONS, v)).join(", ")
                  : "—"}
              </p>
              {r.q5 && (
                <p className="mt-0.5 text-xs italic leading-relaxed text-ink-soft">
                  “{r.q5}”
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(r)}
              disabled={busy === r.id}
              className="shrink-0 rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:border-coral hover:text-coral disabled:opacity-50"
            >
              {busy === r.id ? "…" : "Borrar"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
