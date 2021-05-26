import * as IORedis from 'ioredis';
import { singleton } from 'tsyringe';

import { Logger } from '../utils';
import { config } from '../../configs';

@singleton()
export class Redis extends IORedis {
  constructor(protected readonly logger: Logger) {
    super(config.redis.default);
    this.on('error', this.logger.error);
  }

  async flushMyKeys() {
    const keys = await this.keys(`${config.redis.default.keyPrefix}*`);
    if (keys.length === 0) {
      return;
    }
    await this.del(...keys.map((key) => key.replace(config.redis.default.keyPrefix!, '')));
  }
}
