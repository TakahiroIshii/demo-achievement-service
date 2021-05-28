import { LogLevel } from '../src/utils';

const localhost = process.env.DOCKER_LOCALHOST || 'localhost';
const sqsRegion = process.env.SQS_REGION || 'localhost';
const sqsEndPoint = process.env.SQS_ENDPOINT || `http://${localhost}:4566`;
const sqsUrlPrefix = process.env.SQS_URL_PREFIX || `http://${localhost}:4566/000000000000/`;

const dynamoRegion = process.env.DYNAMO_REGION || 'localhost';
const dynamoEndPoint = process.env.DYNAMO_ENDPOINT || `http://${localhost}:4566`;
const dynamoPrefix = process.env.TABLE_PREFIX || `local_`;

const redisHost = process.env.REDIS_HOST || localhost;
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisKeyPrefix = process.env.TABLE_PREFIX || `local_`;

const logLevel = process.env.LOG_LEVEL ? Number(process.env.LOG_LEVEL) : LogLevel.Info;

const restPort = Number(process.env.REST_PORT) || 3333;

export const config = {
  logLevel,
  restPort,
  redis: {
    default: {
      host: redisHost,
      port: redisPort,
      keyPrefix: redisKeyPrefix,
    },
  },
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
    prefix: dynamoPrefix,
  },
};
