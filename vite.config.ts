import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: false, // ✅ disable SSR server for Vercel
  },
});