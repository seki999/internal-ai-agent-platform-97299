import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "../components/StatCard";

/**
 * 表示専用componentへ渡したKPI値が、利用者に読めるtextとして描画されることを確認する。
 * class名やDOM階層ではなく表示内容を検証し、デザイン変更で壊れにくいtestにしている。
 */
describe("StatCard", () => {
  it("KPIと補足情報を表示する", () => {
    render(<StatCard label="稼働エージェント" value={3} meta="all healthy" icon="◇" tone="violet" />);
    expect(screen.getByText("稼働エージェント")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("all healthy")).toBeInTheDocument();
  });
});
