FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY contracts ./contracts
COPY services ./services

RUN npm install
RUN npm run build:shared && npm run build:billing

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/services/subscription-billing-service/dist ./services/subscription-billing-service/dist
COPY contracts ./contracts

CMD ["node", "services/subscription-billing-service/dist/main.js"]
