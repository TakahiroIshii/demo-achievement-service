import * as express from 'express';
import { DependencyContainer, container, singleton } from 'tsyringe';

import { AchievementServer } from '../AchievementServer';
import { FieldName, childRouteMap } from './decorators';
import { Logger } from '../utils';

@singleton()
export class Router {
  constructor(private readonly server: AchievementServer) {}

  init() {
    return this.exposeRestApi();
  }

  private exposeRestApi() {
    for (const [Class, fieldMap] of childRouteMap) {
      for (const [field, { method, childRoute }] of fieldMap) {
        const route = childRoute;
        const methodName = method.toLowerCase();
        const handler = this.createExpressHandler(Class, field);
        this.server.app[methodName](route, handler);
      }
    }
    return this;
  }

  private createExpressHandler(Class: Constructor, field: FieldName) {
    return async (req: express.Request, res: express.Response) => {
      try {
        const params = Object.assign(req.params, req.query, req.body);
        const child = container.createChildContainer();
        res.send(await processRequest(child, Class, field, params));
      } catch (err) {
        res.status(err.statusCode).send(err);
      }
    };
  }
}

async function processRequest(container: DependencyContainer, Class: Constructor, field: FieldName, params: Obj) {
  const logger = container.resolve(Logger);
  try {
    logger.info('request params', params);
    const controller = container.resolve(Class);
    return await controller[field](params);
  } catch (err) {
    logger.error('Error!', err);
  }
}
