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
ENV PM2_PUBLIC_KEY ukporvmhk92azqt
ENV PM2_SECRET_KEY 0c6ncosh4mchb6v
CMD ["pm2-runtime", "dist/index.js"]

