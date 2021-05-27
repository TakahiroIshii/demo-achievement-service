// import-sort-ignore
import 'reflect-metadata';
import 'source-map-support/register';

import * as fs from 'fs';
import Aigle from 'aigle';
import { Lifecycle, container, singleton } from 'tsyringe';

import { AchievementServer } from './AchievementServer';
import { Logger, runAsync } from './utils';
import { Router } from './controllers/Router';

import path = require('path');
import { config } from '../configs';

@singleton()
class Main {
  constructor(private readonly achievementServer: AchievementServer, private readonly router: Router) {}

  async listen() {
    this.router.init();
    await this.achievementServer.listen();
  }

  async close() {
    return await this.achievementServer.close();
  }
}

// to stop dynamo-types to log errors
console.log = function () {};

function readFiles(dirPath: string) {
  for (const fileName of fs.readdirSync(dirPath)) {
    const filePath = path.resolve(dirPath, fileName);
    if (fs.statSync(filePath).isDirectory()) {
      readFiles(filePath);
      continue;
    }
    if (/\.d\.ts/.test(filePath)) {
      continue;
    }
    if (/\.(js|ts)$/.test(filePath)) {
      require(filePath);
    }
  }
}

export async function initInstances() {
  const srcPath = path.resolve(__dirname, '.');
  readFiles(srcPath);

  const thisContainer: any = container;
  await Aigle.forEach(Array.from(thisContainer._registry._registryMap), ([Class, [option]]) => {
    if (option?.options?.lifecycle !== Lifecycle.Singleton) {
      return;
    }
    const instance = thisContainer.resolve(Class);
    if (typeof instance.init === 'function') {
      return instance.init();
    }
  });
}

const logger = new Logger(config.logLevel);
container.register(Logger, { useValue: logger });
const main = container.resolve(Main);

runAsync(async () => {
  await initInstances();
  await main.listen();
});

process.on('SIGINT', async () => {
  const logger = container.resolve(Logger);
  logger.info('Closing server...');
  try {
    await main.close();
    process.exit(0);
  } catch (err) {
    logger.error('Closing server failed', err);
    process.exit(1);
  }
});
