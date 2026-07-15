import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const seedFile = new URL("./database.json", import.meta.url);
const dataFile = new URL("./database.local.json", import.meta.url);

// すべてのresponseをUTF-8 JSONへ統一し、Backend adapterが分岐なしで処理できるようにする。
const send = (response, status, body) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
};

// request bodyをstreamから集約する。mock用途のためJSON以外は受け付けない。
const bodyOf = async (request) => {
  const parts = [];
  for await (const part of request) parts.push(part);
  return JSON.parse(Buffer.concat(parts).toString("utf8") || "{}");
};

// 初回だけ中立的seedを複製し、以降の実行データはGit管理外ファイルへ保存する。
const load = async () => {
  try {
    return JSON.parse(await readFile(dataFile, "utf8"));
  } catch {
    const seed = JSON.parse(await readFile(seedFile, "utf8"));
    await writeFile(dataFile, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
    return seed;
  }
};
// 読みやすいインデントを保ち、ローカル調査時にdocument内容を確認しやすくする。
const save = async (data) => writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");

/**
 * Azure CosmosDB の document 保存契約だけを再現する軽量 HTTP mock。
 * partition key や RU 制御は本番接続時に Azure SDK adapter 側で実装する。
 */
createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    // Docker healthcheckは保存データを読まず、processの応答可否だけを高速に確認する。
    if (request.method === "GET" && url.pathname === "/health") return send(response, 200, { status: "ok" });
    const data = await load();
    // session一覧・作成はchat_sessions containerの最小操作を模擬する。
    if (request.method === "GET" && url.pathname === "/sessions") return send(response, 200, data.chat_sessions);
    if (request.method === "POST" && url.pathname === "/sessions") {
      const body = await bodyOf(request); const timestamp = new Date().toISOString();
      const session = { id: randomUUID(), title: body.title, userId: body.userId, createdAt: timestamp, updatedAt: timestamp };
      data.chat_sessions.push(session); await save(data); return send(response, 201, session);
    }
    // sessionIdをpartition keyとみなし、messageの取得・追加を同じURL配下へまとめる。
    const match = url.pathname.match(/^\/sessions\/([^/]+)\/messages$/);
    if (match && request.method === "GET") return send(response, 200, data.chat_messages.filter((message) => message.sessionId === match[1]));
    if (match && request.method === "POST") {
      const body = await bodyOf(request); const timestamp = new Date().toISOString();
      const message = { id: randomUUID(), sessionId: match[1], role: body.role, content: body.content, createdAt: timestamp };
      data.chat_messages.push(message);
      const session = data.chat_sessions.find((item) => item.id === match[1]); if (session) session.updatedAt = timestamp;
      await save(data); return send(response, 201, message);
    }
    return send(response, 404, { error: "document endpoint が見つかりません" });
  } catch (_error) {
    // filesystemやJSONの内部エラー詳細をclientへ公開せず、固定messageに置き換える。
    return send(response, 500, { error: "CosmosDB compatible mock で処理に失敗しました" });
  }
}).listen(8090, "0.0.0.0", () => console.log("CosmosDB compatible mock: http://localhost:8090"));
