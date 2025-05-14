FROM node:23-alpine AS base
RUN apk add --no-cache python3 py3-pip make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS development
WORKDIR /app
COPY . .

FROM base AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM base AS prune
WORKDIR /app
RUN npm prune --omit=dev

FROM node:23-slim AS production
WORKDIR /app
COPY --from=prune /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]