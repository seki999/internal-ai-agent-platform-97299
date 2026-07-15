# build stageではViteとTypeScriptを使って配信用static assetsを生成する。
FROM node:20-alpine AS build
WORKDIR /app
# root lockfileとworkspace manifestを先にcopyし、source変更時も依存layerを再利用できるようにする。
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN npm ci --workspace frontend --include-workspace-root=false
COPY frontend ./frontend
ARG VITE_API_BASE_URL=http://localhost:3001/api
# Viteの環境変数はbuild時にbundleへ埋め込まれるため、ARGから明示的に渡す。
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build --workspace frontend

# runtime stageはNodeの軽量static serverだけを持ち、compilerを含めない。
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve@14.2.4
COPY --from=build /app/frontend/dist ./dist
# Docker ComposeとREADMEで共通利用するFrontend公開port。
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
