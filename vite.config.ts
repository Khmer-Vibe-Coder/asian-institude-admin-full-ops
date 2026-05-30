import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // ❌ DO NOT include tanstackStart.server at all
  nitro: {
    preset: "vercel",
    output: {
      dir: ".vercel/output",
      serverDir: ".vercel/output/functions/__server.func",
      publicDir: ".vercel/output/static",
    },
  },
});