FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json tsconfig.build.json nest-cli.json* ./
RUN npm install --legacy-peer-deps

COPY src ./src
RUN npm run build --legacy-peer-deps

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install --legacy-peer-deps --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3005/health || exit 1

CMD ["node", "dist/main.js"]




