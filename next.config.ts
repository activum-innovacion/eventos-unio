import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el overlay de Next.js Dev Tools (solo aparece en desarrollo) para
  // que no tape la barra de navegación inferior al previsualizar en móvil.
  devIndicators: false,
  // /proponer se retiró: redirige enlaces antiguos a Votaciones (evita 404).
  async redirects() {
    return [
      { source: "/proponer", destination: "/votaciones", permanent: true },
    ];
  },
};

export default nextConfig;
