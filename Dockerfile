FROM node:16
WORKDIR /etc/bab/app
COPY ./package.json .
RUN npm install
COPY . .