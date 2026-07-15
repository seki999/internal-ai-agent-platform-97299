import { expect, test } from "@playwright/test";

test("mock login 後に主要画面を遷移できる", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Mock login/ }).click();
  await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();
  await page.getByRole("link", { name: /生成AIチャット/ }).click();
  await expect(page.getByRole("heading", { name: "生成AIチャット" })).toBeVisible();
  await page.getByRole("link", { name: /AIエージェント/ }).click();
  await expect(page.getByRole("heading", { name: "AIエージェント管理" })).toBeVisible();
});
