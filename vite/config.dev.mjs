import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
  define: {
    DEBUG_LEVEL: 2, // 0 = no debug, 1 = console logs, 2 = console logs + debug overlays
  },
  server: {
    port: 8080,
  },
});
