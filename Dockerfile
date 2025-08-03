
FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Add environment variable
ENV GOOGLE_CLOUD_PROJECT=fs-alert-d4f21
ENV ENV=prod

CMD ["npm", "start"]