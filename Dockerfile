# ─── Stage 1: Build Frontend ───
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ─── Stage 2: Production Server ───
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 3001
CMD ["node", "src/index.js"]

