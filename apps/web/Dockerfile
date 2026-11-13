# Build from the repository root: docker build -f apps/web/Dockerfile .

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# npm needs every workspace manifest to resolve the lockfile.
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --workspace @budget-book/web
COPY apps/web ./apps/web
# Baked into canonical links and the sitemap at build time.
ARG VITE_SITE_URL=http://localhost:8080
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build --workspace @budget-book/web

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
