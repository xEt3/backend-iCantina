FROM node:14

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN node_modules/typescript/bin/tsc > /dev/null | exit 0;

EXPOSE 3000

CMD ["npm", "start"]

