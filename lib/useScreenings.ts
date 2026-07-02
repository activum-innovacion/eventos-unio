"use client";

import { useEffect, useState } from "react";
import type { Screening } from "./types";

/** Carga la programación desde la API (cliente) y expone el "ahora" del navegador. */
export function useScreenings() {
  const [screenings, setScreenings] = useState<Screening[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    setNow(new Date());
    let alive = true;
    fetch("/api/screenings")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setScreenings(d.screenings ?? []);
      })
      .catch(() => alive && setError("No se pudo cargar la programación."));
    return () => {
      alive = false;
    };
  }, []);

  return { screenings, error, now };
}
