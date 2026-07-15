interface Props {
  tone?: "success" | "warning" | "neutral";
  children: React.ReactNode;
}

/**
 * 一覧・詳細・実行結果で状態表示を同じ視覚表現に揃える共通component。
 * toneを限定したunion型にし、任意のclass名が混入してデザイン規則が崩れないようにする。
 */
export function StatusBadge({ tone = "success", children }: Props) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}
