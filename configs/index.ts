import { LogLevel } from '../src/utils';

const localhost = process.env.DOCKER_LOCALHOST || 'localhost';
const sqsRegion = process.env.SQS_REGION || 'localhost';
const sqsEndPoint = process.env.SQS_ENDPOINT || `http://${localhost}:4566`;

const dynamoRegion = process.env.DYNAMO_REGION || 'localhost';
const dynamoEndPoint = process.env.DYNAMO_ENDPOINT || `http://${localhost}:4566`;
const dynamoPrefix = process.env.TABLE_PREFIX || `local_`;

const sqsUrlPrefix = process.env.SQS_URL_PREFIX || `http://${localhost}:4566/000000000000/`;

const logLevel = process.env.LOG_LEVEL ? Number(process.env.LOG_LEVEL) : LogLevel.Debug;

export const config = {
  logLevel,
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
