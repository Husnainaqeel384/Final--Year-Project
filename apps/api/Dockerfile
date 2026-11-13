# Build from the repository root: docker build -f apps/api/Dockerfile .

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# npm needs every workspace manifest to resolve the lockfile.
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --omit=dev --workspace @budget-book/api

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node apps/api ./apps/api
# Created here so the mounted volume inherits ownership by the non-root user.
RUN mkdir -p apps/api/uploads && chown -R node:node apps/api/uploads
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/api/src/server.js"]
