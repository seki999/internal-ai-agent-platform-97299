import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Vite開発server、preview、Vitestの共通設定。
 * 開発・Playwright撮影で同じ固定portを利用し、README記載URLとの不一致を防ぐ。
 */
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 5173 },
  test: {
    // React componentが利用するDOM APIをNode上で再現するためjsdomを選択する。
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
  },
});
