FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

CMD ["node", "dist/index.js"]

ENV GOOGLE_CLOUD_PROJECT=fx-alert-470308
ENV ENV=prod
ENV SECRETS_NAME=fx_alert_secrets