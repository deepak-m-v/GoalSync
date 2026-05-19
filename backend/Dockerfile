# GoalSync API — production multi-stage image
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

FROM deps AS build
COPY . .
RUN npx prisma generate

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl dumb-init \
  && addgroup -g 1001 -S goalsync \
  && adduser -S goalsync -u 1001 -G goalsync

COPY --from=build --chown=goalsync:goalsync /app/node_modules ./node_modules
COPY --from=build --chown=goalsync:goalsync /app/package.json ./
COPY --from=build --chown=goalsync:goalsync /app/prisma ./prisma
COPY --from=build --chown=goalsync:goalsync /app/src ./src
COPY --chown=goalsync:goalsync docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

USER goalsync
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
