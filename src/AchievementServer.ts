import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as util from 'util';
import { singleton } from 'tsyringe';

import { Logger } from './utils';

@singleton()
export class AchievementServer {
  readonly app = express();
  readonly server = http.createServer(this.app);
  protected readonly port = 3333;
  constructor(protected readonly logger: Logger) {
    this.app.use(bodyParser.json({ limit: '2mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }));
    this.app.use(bodyParser.text());
  }

  async listen() {
    const { port } = this;
    this.server.listen(port, '0.0.0.0');
    return new Promise<void>((resolve, reject) => {
      this.server
        .on('listening', () => {
          this.logger.info(`Listening server on ${port}`);
          resolve();
        })
        .on('error', (error) => {
          this.logger.error(`Error for ${port} server`, error);
          reject(error);
        });
    });
  }

  async close() {
    return util.promisify(this.server.close.bind(this.server))();
  }
}
