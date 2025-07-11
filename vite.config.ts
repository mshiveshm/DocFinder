import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  root: "client",               // ← only one root
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  publicDir: "public",          // copies client/public → dist/
  build: {
    outDir: "../dist",          // ← emit into project-root/dist
    emptyOutDir: true,          // clears dist before build
    assetsDir: "assets",        // puts compiled JS/CSS into dist/assets
    rollupOptions: {
      input: path.resolve(__dirname, "client/index.html"),  
    },
  },
});
