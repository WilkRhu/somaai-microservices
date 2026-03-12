FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json* ./
COPY nest-cli.json* ./

RUN npm install --legacy-peer-deps

COPY src ./src

RUN npm run build --legacy-peer-deps

FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl python3 make g++

COPY package*.json ./

RUN npm install --legacy-peer-deps --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3011

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3011/health || exit 1

CMD ["node", "dist/main.js"]



