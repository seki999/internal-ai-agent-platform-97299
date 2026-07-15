import { NavLink, Outlet } from "react-router-dom";

// route・表示名・iconを同じ配列で管理し、sidebar項目追加時の修正箇所を一つにする。
const navItems = [
  { to: "/", label: "ダッシュボード", icon: "⌂", end: true },
  { to: "/chat", label: "生成AIチャット", icon: "✦" },
  { to: "/agents", label: "AIエージェント", icon: "◇" },
  { to: "/evaluation", label: "AIサービス検証", icon: "◎" },
  { to: "/monitoring", label: "ログ・監視", icon: "⌁" },
];

/**
 * 全業務画面で共通利用するsidebar/topbarレイアウト。
 * NavLinkのactive判定により、現在地を視覚的に示しながら実際のrouteへ遷移する。
 * Outlet部分だけを差し替えるため、運用コンソールとして一貫した操作感を維持できる。
 */
export function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div><strong>Agent Fabric</strong><span>INTERNAL PLATFORM</span></div>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="system-state"><i />All systems operational</div>
          <div className="profile"><span>PM</span><div><strong>Platform Manager</strong><small>mock-user</small></div></div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="environment"><i /> Azure mock environment</div>
          <div className="top-actions"><button aria-label="通知">●</button><span>2026.07.15</span></div>
        </header>
        <div className="page-wrap"><Outlet /></div>
      </main>
    </div>
  );
}
