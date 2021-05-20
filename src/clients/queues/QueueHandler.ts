import Aigle from 'aigle';
import { container, singleton } from 'tsyringe';

import { FunctionName, Logger, runAsync } from '../../utils';
import { Sqs } from './Sqs';
import { config } from '../../../configs';

type QueueName = string;

interface RequestParams {
  WaitTimeSeconds: number;
  MaxNumberOfMessages: number;
}

interface SqsHandler {
  Class: Constructor;
  functionName: keyof Constructor;
  requestParams: RequestParams;
}

export function Queue(
  name: QueueName,
  requestParams = {
    WaitTimeSeconds: config.sqs.waitTime,
    MaxNumberOfMessages: config.sqs.maxNum,
  },
) {
  return <T>(instance: T, field: keyof T) => {
    const { constructor } = instance as any;
    if (!name) {
      console.info('queue name not defined', { name: constructor.name, field });
      return;
    }
    if (config.sqs.urlPrefix == '') {
      console.info('queue url prefix not defined');
      return;
    }
    QueueHandler.addHandler<Constructor<T>>(name, constructor, field, requestParams);
  };
}

@singleton()
export class QueueHandler {
  private static readonly delay = 10 * 1000;
  private static readonly handlerMap = new Map<QueueName, SqsHandler>();
  constructor(readonly logger: Logger, readonly sqs: Sqs) {}

  async init() {
    for (const [name, handler] of QueueHandler.handlerMap) {
      this.createEvent(name, handler);
    }
  }

  private createEvent(name: QueueName, handler: SqsHandler) {
    runAsync(async () => {
      while (this.sqs.open) {
        try {
          await this.receiveMessages(name, handler);
        } catch (err) {
          this.logger.error('SQS error', { name, err });
          await Aigle.delay(QueueHandler.delay);
        }
      }
      this.logger.info('processMessage cancel requested.');
    });
  }

  async sendMessage<T extends Obj>(name: QueueName, body: T) {
    if (!name || name === '') {
      this.logger.error('name is empty, cannot send message to SQS');
      return;
    }
    const queueUrl = `${config.sqs.urlPrefix}${name}`;
    return await this.sqs.client.sendMessage({ QueueUrl: queueUrl, MessageBody: JSON.stringify(body) }).promise();
  }

  private async receiveMessages(name: QueueName, handler: SqsHandler) {
    const queueUrl = `${config.sqs.urlPrefix}${name}`;
    const sqsResponse = await this.sqs.client
      .receiveMessage({ QueueUrl: queueUrl, ...handler.requestParams })
      .promise();
    this.logger.debug('sqsResponse', { queueUrl, sqsResponse });

    if (!sqsResponse.Messages) {
      this.logger.debug('sqs receiveMessages timed out.');
      return;
    }

    await Aigle.each(sqsResponse.Messages, async (message) => {
      const body = JSON.parse(message.Body!);
      const instance = container.resolve(handler.Class);
      try {
        this.logger.debug('Sqs events', { className: handler.Class.name, functionName: handler.functionName, body });
        await instance[handler.functionName](body);
        this.logger.debug('deleting...', { queueUrl, message });
        await this.sqs.client.deleteMessage({ ReceiptHandle: message.ReceiptHandle!, QueueUrl: queueUrl }).promise();
        this.logger.debug('...deleted', { queueUrl, message });
      } catch (err) {
        this.logger.error('sqs process error', err, { queueUrl, message });
      }
    });
  }

  static addHandler<T extends Constructor>(
    name: QueueName,
    Class: T,
    functionName: FunctionName<T>,
    requestParams: RequestParams,
  ) {
    this.handlerMap.set(name, { Class, functionName, requestParams });
    return this;
  }
}
