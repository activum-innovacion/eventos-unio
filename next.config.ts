import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el overlay de Next.js Dev Tools (solo aparece en desarrollo) para
  // que no tape la barra de navegación inferior al previsualizar en móvil.
  devIndicators: false,
  // Votaciones y /proponer se retiraron de la web pública: enlaces antiguos → home.
  async redirects() {
    return [
      { source: "/votaciones", destination: "/", permanent: true },
      { source: "/proponer", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
