import Aigle from 'aigle';
import { container, singleton } from 'tsyringe';

import { FunctionName, Logger, runAsync } from '../../utils';
import { Redis } from '../Redis';
import { Sqs } from './Sqs';
import { config } from '../../../configs';

type QueueName = string;

interface SqsHandler {
  Class: Constructor;
  functionName: keyof Constructor;
}

export function Queue(name: QueueName) {
  return <T>(instance: T, field: keyof T) => {
    const { constructor } = instance as any;
    if (!name || config.sqs.urlPrefix == '') {
      console.info('queue name is empty', { name: constructor.name, field });
      return;
    }
    QueueHandler.addHandler<Constructor<T>>(name, constructor, field);
  };
}

@singleton()
export class QueueHandler {
  private static queueCacheKey = 'queueCacheKey';
  private static readonly handlerMap = new Map<QueueName, SqsHandler>();
  constructor(readonly logger: Logger, readonly sqs: Sqs, readonly redis: Redis) {}
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
        }
      }
      this.logger.info('processMessage cancelled.');
    });
  }

  private async receiveMessages(name: QueueName, handler: SqsHandler) {
    const queueUrl = `${config.sqs.urlPrefix}${name}`;
    const sqsResponse = await this.sqs.client
      .receiveMessage({
        QueueUrl: queueUrl,
        ...{
          WaitTimeSeconds: config.sqs.waitTime,
          MaxNumberOfMessages: config.sqs.maxNum,
        },
      })
      .promise();
    if (!sqsResponse.Messages) {
      return;
    }
    await Aigle.each(sqsResponse.Messages, async (message) => {
      const body = JSON.parse(message.Body!);
      this.logger.info('request params', body);
      const messageId = message.MessageId!;
      const instance = container.resolve(handler.Class);
      const key = `${QueueHandler.queueCacheKey}${messageId}`;
      const result = await this.redis.set(key, 'done', 'EX', 30, 'NX');
      if (!result) {
        this.logger.info('DUPLICATION!');
        return;
      }
      try {
        await instance[handler.functionName](body);
      } catch (err) {
        this.logger.error('sqs message handle error', err, { queueUrl, message });
      }
      this.logger.debug('deleted', { messageId });
      runAsync(this.sqs.client.deleteMessage({ ReceiptHandle: message.ReceiptHandle!, QueueUrl: queueUrl }).promise());
    });
  }

  static addHandler<T extends Constructor>(name: QueueName, Class: T, functionName: FunctionName<T>) {
    this.handlerMap.set(name, { Class, functionName: functionName as never });
    return this;
  }
}
