FROM node:18-alpine AS base
RUN apk add --no-cache python3 py3-pip make g++
WORKDIR /app
COPY package.json package-lock.json ./
ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "development" ]; then npm install; else npm install --production; fi

FROM base AS development
WORKDIR /app
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS build
ARG NODE_ENV=production
WORKDIR /app
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]

