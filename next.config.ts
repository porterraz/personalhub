import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Force Turbopack to use this app folder (avoids picking parent C:\Users\porte\package-lock.json)
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
