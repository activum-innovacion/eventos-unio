"use client";

import { useRef, useState } from "react";

export function ImageUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir la imagen.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Error de red al subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-3">
        <div className="grid h-20 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-cream">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Cartel"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl text-muted">🎬</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-indigo hover:text-indigo disabled:opacity-50"
          >
            {uploading ? "Subiendo…" : value ? "Cambiar imagen" : "Subir imagen"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-left text-[0.7rem] font-medium text-muted hover:text-coral"
            >
              Quitar
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-coral">{error}</p>}
    </div>
  );
}
