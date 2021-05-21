# demo-acchivement-service

## run docker image

```
yarn build:service
docker build -t demo-achievement-service .
docker run --env DOCKER_LOCALHOST=docker.for.mac.localhost demo-achievement-service
```
