import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  eslint: {
    // DISABLE ESLint durante el build para acelerar el proceso
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Solo verificar errores de TypeScript críticos
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
