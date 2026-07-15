import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AgentRunPage } from "./pages/AgentRunPage";
import { AgentsPage } from "./pages/AgentsPage";
import { AiEvaluationPage } from "./pages/AiEvaluationPage";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { MonitoringPage } from "./pages/MonitoringPage";

/**
 * 認証状態と画面routeを管理するアプリケーションroot。
 * 案件では認証方式が未記載のため、sessionStorageによるmock状態だけを扱い、
 * 実認証を実装済みであると誤認させない構成にしている。
 */
export default function App() {
  // tabを閉じると消えるsessionStorageを使い、永続的な認証情報を端末へ残さない。
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("mock-auth") === "true");
  if (!authenticated) return <LoginPage onLogin={() => { sessionStorage.setItem("mock-auth", "true"); setAuthenticated(true); }} />;

  // Layout配下に業務routeをネストし、sidebar/topbarを再マウントせず画面だけを切り替える。
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="agents/:id/run" element={<AgentRunPage />} />
        <Route path="evaluation" element={<AiEvaluationPage />} />
        <Route path="monitoring" element={<MonitoringPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
