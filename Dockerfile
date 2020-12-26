FROM node:14

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
COPY config-prod.ts config.ts
RUN node_modules/typescript/bin/tsc > /dev/null | exit 0;

EXPOSE 5100
RUN npm install pm2 -g
CMD ["pm2-runtime", "dist/index.js"]

