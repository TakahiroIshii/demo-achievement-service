/* import-sort-ignore */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

import '../src/clients/queues';
import '../src/services';
import '../src/repositories';

import { Logger, LogLevel } from '../src/utils';
import { container, Lifecycle } from 'tsyringe';
import Aigle from 'aigle';
import { BaseRepository } from '../src/repositories';

const logger = new Logger({ logLevel: LogLevel.Debug });
container.register(Logger, { useValue: logger });

before(async () => {
  const thisContainer: any = container;
  const instances = Array.from(thisContainer._registry._registryMap).flatMap(([Class, [option]]) => {
    if (option?.options?.lifecycle !== Lifecycle.Singleton) {
      return [];
    }
    return thisContainer.resolve(Class);
  });
  await Aigle.forEach(instances, async (instance) => {
    if (!instance) {
      return;
    }
    try {
      if (instance instanceof BaseRepository) {
        try {
          await instance.dropTable();
        } catch (err) {
          logger.debug('drop table error!', err);
        }
        await instance.init();
      } else if (typeof instance.init === 'function') {
        await instance.init();
      }
    } catch (err) {
      logger.error('Initialization failed', { name: instance.constructor.name, err });
    }
  });
});
