FROM node:13
MAINTAINER Glenn Y. Rolland <glenux@glenux.net>

COPY . /app

WORKDIR /app

RUN npm install \
 && make build

