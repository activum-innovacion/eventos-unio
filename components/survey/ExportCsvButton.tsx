"use client";

import {
  Q1_OPTIONS,
  Q3_OPTIONS,
  Q4_OPTIONS,
  labelFor,
  type SurveyResponse,
} from "@/lib/survey";

function csvCell(value: string): string {
  const v = value ?? "";
  return /[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function ExportCsvButton({
  responses,
}: {
  responses: SurveyResponse[];
}) {
  function download() {
    const header = [
      "Fecha",
      "P1 Asistencia",
      "P2 Valoración",
      "P3 Selección",
      "P4 Mejoras",
      "P5 Ideas",
    ];
    const rows = responses.map((r) => [
      new Date(r.createdAt).toLocaleString("es-ES"),
      labelFor(Q1_OPTIONS, r.q1),
      r.q2 === null ? "No he asistido" : String(r.q2),
      labelFor(Q3_OPTIONS, r.q3),
      r.q4.map((v) => labelFor(Q4_OPTIONS, v)).join(" · "),
      r.q5,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    // BOM para que Excel respete los acentos (UTF-8).
    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `encuesta-unio-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={responses.length === 0}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-bold text-ink-soft transition-colors hover:border-indigo hover:text-indigo disabled:opacity-40"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
      </svg>
      CSV
    </button>
  );
}
