FROM node:23-slim AS base
WORKDIR /app
COPY package.json package-lock.json ./

FROM base AS build-deps
RUN npm install

FROM build-deps AS build
COPY . .
RUN npm run build


FROM caddy:2.7.5-alpine AS runtime
WORKDIR /usr/share/caddy
COPY --from=build /app/dist ./
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
