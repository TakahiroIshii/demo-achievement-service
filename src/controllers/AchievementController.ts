import { injectable } from 'tsyringe';

import { AchievementService } from '../services';
import { Get, Post } from './decorators';
import { Queue } from '../clients/queues';
import { config } from '../../configs';

interface AchievementRequest {
  userId: string;
  achievementId: string;
}

interface GetAchievementsRequest {
  userId: UserId;
}

@injectable()
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Queue(config.sqs.names.achievementQueue)
  async progress({ userId, achievementId }: AchievementRequest) {
    await this.achievementService.progress(userId, achievementId);
  }

  @Post('/achievements')
  async progressRest({ userId, achievementId }: AchievementRequest) {
    await this.achievementService.progress(userId, achievementId);
  }

  @Get('/achievements/:userId')
  async getAll({ userId }: GetAchievementsRequest) {
    return this.achievementService.getAll(userId);
  }
}
