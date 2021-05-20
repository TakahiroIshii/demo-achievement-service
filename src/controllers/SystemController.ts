import { injectable } from 'tsyringe';

import * as packageJson from '../../package.json';
import { Get } from './decorators';

@injectable()
export class SystemController {
  @Get('/version')
  async version() {
    return { version: packageJson.version };
  }
}
