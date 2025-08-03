
FROM node:20 AS builder

WORKDIR /usr/src/app


COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build


FROM node:20-slim AS production

WORKDIR /usr/src/app


COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

COPY --from=builder /usr/src/app/package.json ./

# Set environment variables
ENV GOOGLE_CLOUD_PROJECT=fs-alert-d4f21
ENV NODE_ENV=prod
ENV PORT=8080

# Create non-root user for security
RUN groupadd -g 1001 appgroup && useradd -r -u 1001 -g appgroup appuser
USER appuser

CMD ["npm", "start"]
