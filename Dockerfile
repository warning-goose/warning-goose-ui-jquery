FROM node:13
MAINTAINER Glenn Y. Rolland <glenux@glenux.net>

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

CMD make build

