# build stageではTypeScript compilerを含むdevDependenciesを使用する。
FROM node:20-alpine AS build
WORKDIR /app
# npm workspaceのlockfileを利用し、ローカル/CI/Dockerで同じ依存バージョンを再現する。
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm ci --workspace backend --include-workspace-root=false
COPY backend ./backend
RUN npm run build --workspace backend

# runtime stageにはコンパイル済みJavaScriptとproduction依存だけを含める。
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm ci --workspace backend --include-workspace-root=false --omit=dev
COPY --from=build /app/backend/dist ./backend/dist
WORKDIR /app/backend
# Express APIの公開port。接続先DB情報はdocker-composeの環境変数から受け取る。
EXPOSE 3001
CMD ["npm", "run", "start"]
