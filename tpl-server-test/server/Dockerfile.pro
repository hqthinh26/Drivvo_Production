FROM node:10

WORKDIR /usr/app

COPY package.json yarn.lock /usr/app/

RUN yarn install

COPY . /usr/app