import * as aws from 'aws-sdk';
import { singleton } from 'tsyringe';

import { config } from '../../../configs';

@singleton()
export class Sqs {
  readonly client = new aws.SQS({
    region: config.sqs.region,
    endpoint: config.sqs.endpoint,
  });
  open = true;

  close() {
    this.open = false;
  }
}
