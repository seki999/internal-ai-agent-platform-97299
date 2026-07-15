import { defineConfig } from "@playwright/test";

// root package script から実行するため、workspace root を明示して起動する。
const repositoryRoot = process.cwd();

/** frontend/backend を同時起動し、E2E とスクリーンショットの再現性を揃える。 */
export default defineConfig({
  testDir: ".",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1440, height: 950 },
    colorScheme: "light",
  },
  webServer: [
    {
      command: "npm run dev --workspace backend",
      cwd: repositoryRoot,
      url: "http://127.0.0.1:3001/api/health",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npm run dev --workspace frontend",
      cwd: repositoryRoot,
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
