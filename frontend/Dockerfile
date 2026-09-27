# ---- Stage 1: build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
# --ignore-engines: @testing-library/jest-dom (dev, só testes) declara node>=22;
# o build Vite não o empacota, e o npm anterior já ignorava engines por padrão.
RUN yarn install --frozen-lockfile --ignore-engines
COPY . .
RUN yarn build

# ---- Stage 2: produção ----
FROM nginxinc/nginx-unprivileged:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080