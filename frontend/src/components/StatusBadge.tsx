interface Props {
  tone?: "success" | "warning" | "neutral";
  children: React.ReactNode;
}

/** 一覧画面で状態を同じ視覚表現に揃える。 */
export function StatusBadge({ tone = "success", children }: Props) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}
