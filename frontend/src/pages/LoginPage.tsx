interface Props { onLogin: () => void }

/**
 * 案件で認証方式は未記載のため、画面遷移確認だけを目的とする mock login。
 * 本番では Entra ID / OIDC に置き換える境界となる。
 */
export function LoginPage({ onLogin }: Props) {
  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-logo">AI</div>
        <p>ENTERPRISE AI OPERATIONS</p>
        <h1>業務とAIを、<br />安全につなぐ基盤。</h1>
        <p className="login-copy">チャット、エージェント、検証、監視を一つのポータルへ統合します。</p>
        <div className="orbit"><span>Agent</span><span>Data</span><span>Guard</span><i>✦</i></div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <span className="eyebrow">MOCK AUTHENTICATION</span>
          <h2>ポータルへログイン</h2>
          <p>検証用アカウントで社内AIエージェント基盤へアクセスします。</p>
          <label>ユーザーID<input value="mock-user@internal.local" readOnly /></label>
          <label>パスワード<input value="mock-password" type="password" readOnly /></label>
          <button className="primary-button login-button" onClick={onLogin}>Mock login で続行 <span>→</span></button>
          <div className="login-note">認証方式は案件中未明記のため、簡易 mock login として実装</div>
        </div>
      </section>
    </main>
  );
}
