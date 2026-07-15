import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// 開発・スクリーンショット生成で同じ固定ポートを利用する。
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 5173 },
  test: {
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
  },
});
