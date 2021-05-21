import * as _ from 'lodash';

const localhost = process.env.DOCKER_LOCALHOST || 'localhost';
const sqsRegion = process.env.SQS_REGION || 'localhost';
const sqsEndPoint = process.env.SQS_ENDPOINT || `http://${localhost}:4566`;

const dynamoRegion = process.env.DYNAMO_REGION || 'localhost';
const dynamoEndPoint = process.env.DYNAMO_ENDPOINT || `http://${localhost}:4566`;

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisDatabase = Number(process.env.REDIS_DATABASE) || 0;
const redisKeyPrefix = `achievement_prefix:`;

const sqsUrlPrefix = process.env.SQS_URL_PREFIX || `http://${localhost}:4566/000000000000/`;

export const config = {
  sqs: {
    region: sqsRegion,
    endpoint: sqsEndPoint,
    waitTime: 20,
    maxNum: 10,
    urlPrefix: sqsUrlPrefix,
    names: {
      achievementQueue: 'achievementQueue',
    },
  },
  dynamo: {
    region: dynamoRegion,
    endpoint: dynamoEndPoint,
    enableAWSXray: false,
  },
};
