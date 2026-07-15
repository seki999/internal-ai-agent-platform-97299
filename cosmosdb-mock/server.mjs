import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const seedFile = new URL("./database.json", import.meta.url);
const dataFile = new URL("./database.local.json", import.meta.url);
const send = (response, status, body) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
};
const bodyOf = async (request) => {
  const parts = [];
  for await (const part of request) parts.push(part);
  return JSON.parse(Buffer.concat(parts).toString("utf8") || "{}");
};
const load = async () => {
  try {
    return JSON.parse(await readFile(dataFile, "utf8"));
  } catch {
    const seed = JSON.parse(await readFile(seedFile, "utf8"));
    await writeFile(dataFile, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
    return seed;
  }
};
const save = async (data) => writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");

/**
 * Azure CosmosDB の document 保存契約だけを再現する軽量 HTTP mock。
 * partition key や RU 制御は本番接続時に Azure SDK adapter 側で実装する。
 */
createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (request.method === "GET" && url.pathname === "/health") return send(response, 200, { status: "ok" });
    const data = await load();
    if (request.method === "GET" && url.pathname === "/sessions") return send(response, 200, data.chat_sessions);
    if (request.method === "POST" && url.pathname === "/sessions") {
      const body = await bodyOf(request); const timestamp = new Date().toISOString();
      const session = { id: randomUUID(), title: body.title, userId: body.userId, createdAt: timestamp, updatedAt: timestamp };
      data.chat_sessions.push(session); await save(data); return send(response, 201, session);
    }
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
    return send(response, 500, { error: "CosmosDB compatible mock で処理に失敗しました" });
  }
}).listen(8090, "0.0.0.0", () => console.log("CosmosDB compatible mock: http://localhost:8090"));
