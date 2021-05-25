# demo-acchivement-service

## start local stack

```
docker-compose up
```

## run server

```
yarn start
```

## run tests

```
yarn test:integration
```

## run docker image

```
yarn build:service
docker build -t demo-achievement-service .
docker run --env DOCKER_LOCALHOST=docker.for.mac.localhost --env LOG_LEVEL=30 --env AWS_ACCESS_KEY_ID=xxx --env AWS_SECRET_ACCESS_KEY=xxx demo-achievement-service
```

## test with test input to local SQS

```
aws --endpoint-url=http://localhost:4566 sqs send-message --queue-url http://localhost:4566/000000000000/achievementQueue --message-body file://testInput.json
```
