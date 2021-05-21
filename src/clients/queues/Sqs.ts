import * as aws from 'aws-sdk';
import { singleton } from 'tsyringe';

import { config } from '../../../configs';

aws.config.update({
  accessKeyId: 'YOURKEY',
  secretAccessKey: 'YOURSECRET',
  region: 'loalhost',
});

@singleton()
export class Sqs {
  readonly client = new aws.SQS({
    region: config.sqs.region,
    endpoint: config.sqs.endpoint,
  });
  open = true;

  async init() {
    await this.client.createQueue({ QueueName: 'achievementQueue' }).promise();
  }

  close() {
    this.open = false;
  }
}
