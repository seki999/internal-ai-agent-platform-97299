interface Props {
  label: string;
  value: string | number;
  meta: string;
  icon: string;
  tone: string;
}

/**
 * DashboardのKPIを、数値・変化・意味が一目で分かる形式にする共通component。
 * API取得は親Pageへ任せ、表示専用にすることでcomponent testを小さく保つ。
 */
export function StatCard({ label, value, meta, icon, tone }: Props) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{meta}</span>
      </div>
    </article>
  );
}
