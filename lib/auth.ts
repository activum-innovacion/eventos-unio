import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Autenticación mínima del panel de administración mediante una contraseña
 * compartida (sin sistema de usuarios). La contraseña se define en la variable
 * de entorno ADMIN_PASSWORD; en local, si no está, se usa un valor por defecto.
 *
 * ⚠️ En producción (Vercel) define ADMIN_PASSWORD con un valor fuerte.
 */

export const ADMIN_COOKIE = "unio_admin";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "cine-unio";
}

/** Token determinista derivado de la contraseña (no reversible por el cliente). */
export function expectedToken(): string {
  return crypto
    .createHash("sha256")
    .update(`${adminPassword()}::unio-cine-2026`)
    .digest("hex");
}

export function checkPassword(pw: unknown): boolean {
  return typeof pw === "string" && pw.length > 0 && pw === adminPassword();
}

export function isValidToken(token: string | undefined | null): boolean {
  return !!token && token === expectedToken();
}

/** Comprueba la cookie de sesión de admin (para usar en server components / APIs). */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return isValidToken(store.get(ADMIN_COOKIE)?.value);
}
