import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
    // The api client reads these at module load. Pin them so tests assert
    // against a known gateway base URL and chat endpoint.
    env: {
      NEXT_PUBLIC_API_URL: "http://127.0.0.1:8080",
      NEXT_PUBLIC_WHATSAPP_NUMBER: "2348000000000",
    },
  },
});
