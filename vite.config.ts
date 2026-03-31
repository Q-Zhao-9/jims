import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `vite preview` is for prod-like builds; local prod API runs on 8001 (see deploy.ps1 / scripts/prod-stack.ps1).
// Override if needed: VITE_PREVIEW_API_PROXY=http://127.0.0.1:8000
const previewApiProxy =
  process.env.VITE_PREVIEW_API_PROXY ?? "http://127.0.0.1:8001";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  // Same proxy for `vite preview` (local “production” build) so /api/v1 hits FastAPI.
  preview: {
    proxy: {
      "/api": {
        target: previewApiProxy,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
