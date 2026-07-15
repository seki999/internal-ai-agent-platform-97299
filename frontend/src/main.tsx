import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";

/**
 * Reactアプリケーションのentry point。
 * BrowserRouterを最上位に置き、各ページが同じ履歴・URL状態を共有できるようにする。
 * StrictModeは開発時に副作用の不適切な実装を検出しやすくするため有効化している。
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
