import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    exclude: ["apps/**", "node_modules/**", "dist/**"],
    environment: "node",
    globals: false,
  },
});
