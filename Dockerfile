FROM node:20-alpine3.21


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]

ENV GOOGLE_CLOUD_PROJECT=fs-alert-d4f21
ENV ENV=prod