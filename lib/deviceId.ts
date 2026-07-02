"use client";

const KEY = "cine-unio-device-id";

/**
 * Identificador estable por dispositivo/navegador guardado en localStorage.
 * Permite contar votos sin obligar a los residentes a registrarse.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
