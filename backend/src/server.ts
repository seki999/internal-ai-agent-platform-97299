import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

// listen処理をapp factoryから分離し、Supertestでは実portを確保せず検証できるようにする。
app.listen(env.port, () => {
  // API key や接続文字列は出力せず、公開して安全な起動情報だけを記録する。
  console.log(`Internal AI Agent Platform API: http://localhost:${env.port}`);
});
