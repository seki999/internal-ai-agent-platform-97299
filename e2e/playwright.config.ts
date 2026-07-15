import { defineConfig } from "@playwright/test";

// root package scriptから実行するため、workspace rootを明示してnpm workspacesを解決する。
const repositoryRoot = process.cwd();

/**
 * Frontend/Backendを同時起動し、E2Eとスクリーンショットの再現性を揃える。
 * workerを1に固定し、同じmemory repositoryを複数testが同時更新しないようにする。
 */
export default defineConfig({
  testDir: ".",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    // CORS設定と同じlocalhostを使い、127.0.0.1とのorigin差異を発生させない。
    baseURL: "http://localhost:5173",
    viewport: { width: 1440, height: 950 },
    colorScheme: "light",
  },
  webServer: [
    {
      // health endpointが応答してからbrowser操作を開始し、起動競合を避ける。
      command: "npm run dev --workspace backend",
      cwd: repositoryRoot,
      url: "http://127.0.0.1:3001/api/health",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      // 既存開発serverがある場合は再利用し、手動検証中にも安全に実行できるようにする。
      command: "npm run dev --workspace frontend",
      cwd: repositoryRoot,
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
