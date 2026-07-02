import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el overlay de Next.js Dev Tools (solo aparece en desarrollo) para
  // que no tape la barra de navegación inferior al previsualizar en móvil.
  devIndicators: false,
};

export default nextConfig;
