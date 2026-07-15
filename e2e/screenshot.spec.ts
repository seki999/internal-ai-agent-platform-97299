import { expect, Page, test } from "@playwright/test";
import path from "node:path";

const output = (name: string) => path.resolve(process.cwd(), "screenshots", name);

/** 画面ごとのscroll差をなくし、READMEで比較しやすい同一viewportのPNGを保存する。 */
async function capture(page: Page, name: string) {
  // route遷移後のscroll位置を戻し、固定sidebarを含むviewportを安定して撮影する。
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: output(name), fullPage: false });
}

/** 未認証ならmock loginを行い、DashboardのAPI読込完了まで待機する。 */
async function login(page: Page) {
  await page.goto("/");
  const button = page.getByRole("button", { name: /Mock login/ });
  if (await button.isVisible()) await button.click();
  await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();
}

/**
 * Portfolioに掲載する6画面を実操作後に撮影する。
 * Agent実行とAI評価は結果表示まで待ち、単なる空フォームではなく動作証跡を画像へ残す。
 */
test("@screenshot portfolio用の実画面を生成する", async ({ page }) => {
  await login(page);
  await capture(page, "dashboard.png");

  await page.getByRole("link", { name: /生成AIチャット/ }).click();
  await expect(page.getByRole("heading", { name: "生成AIチャット" })).toBeVisible();
  await capture(page, "chat.png");

  await page.getByRole("link", { name: /AIエージェント/ }).click();
  await expect(page.getByRole("heading", { name: "AIエージェント管理" })).toBeVisible();
  await capture(page, "agents.png");

  // detail panel の遷移状態に依存せず、route単体でも再現できるURLから撮影する。
  await page.goto("/agents/agent-faq/run");
  await expect(page.getByRole("heading", { name: "FAQ回答エージェント" })).toBeVisible();
  await page.getByRole("button", { name: /Agent を実行/ }).click();
  await expect(page.getByText("EXECUTION COMPLETED")).toBeVisible();
  await capture(page, "agent-run.png");

  await page.getByRole("link", { name: /AIサービス検証/ }).click();
  await page.getByRole("button", { name: /評価を実行/ }).click();
  await expect(page.getByText("SAVED")).toBeVisible();
  await capture(page, "ai-evaluation.png");

  await page.getByRole("link", { name: /ログ・監視/ }).click();
  await expect(page.getByRole("heading", { name: "ログ・監視ダッシュボード" })).toBeVisible();
  await capture(page, "monitoring.png");
});
