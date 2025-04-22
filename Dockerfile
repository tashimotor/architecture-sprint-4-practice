FROM node:lts-alpine3.21
COPY ./src /app
WORKDIR /app
RUN npm i

