import { singleton } from 'tsyringe';

import { Logger } from '../utils';

@singleton()
export class AchievementService {
  constructor(private readonly logger: Logger) {}
  async add(id: string) {
    this.logger.info('Adding an achievement', { id });
  }
}
