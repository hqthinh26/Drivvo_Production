FROM node:10 
WORKDIR /usr/app 
COPY package.json yarn.lock ./ 
RUN yarn install
COPY ./ .
RUN yarn global add sequelize sequelize-cli pg nodemon