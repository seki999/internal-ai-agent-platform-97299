FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm ci --workspace backend --include-workspace-root=false
COPY backend ./backend
RUN npm run build --workspace backend

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm ci --workspace backend --include-workspace-root=false --omit=dev
COPY --from=build /app/backend/dist ./backend/dist
WORKDIR /app/backend
EXPOSE 3001
CMD ["npm", "run", "start"]
