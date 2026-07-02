"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No se pudo iniciar sesión.");
        setLoading(false);
      }
    } catch {
      setError("Error de conexión.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center">
      <div className="w-full max-w-xs">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image
            src="/images/UNIO_LOGOTIPO_AZUL.png"
            alt="ÜNIO Madrid"
            width={140}
            height={66}
            priority
            className="h-8 w-auto"
          />
          <h1 className="brand-heading text-lg text-ink">
            Panel de administración
          </h1>
          <p className="text-xs text-muted">Cine de Verano · ÜNIO Madrid</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            className="w-full rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-indigo focus:ring-2 focus:ring-indigo/15"
          />
          {error && <p className="text-sm text-coral">{error}</p>}
          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="w-full rounded-xl bg-indigo py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform active:scale-95 disabled:opacity-40"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-xs font-medium text-muted hover:text-indigo"
        >
          ← Volver a la web
        </Link>
      </div>
    </div>
  );
}
