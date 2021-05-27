FROM node:15-alpine as intermediate

RUN apk update && apk upgrade && \
    apk add --no-cache bash git python make g++

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install --production

COPY ./dist /app

FROM node:15-alpine

COPY --from=intermediate /app /app

RUN apk update && apk upgrade && \
    apk add --virtual --no-cache openssh

WORKDIR /app/src/
EXPOSE 22
EXPOSE 3333

CMD ["node", "server.js"]
