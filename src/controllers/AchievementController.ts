import { injectable } from 'tsyringe';

import { AchievementService } from '../services';
import { Queue } from '../clients/queues';
import { config } from '../../configs';

interface AchievementRequest {
  userId: string;
  achievementId: string;
}

@injectable()
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Queue(config.sqs.names.achievementQueue)
  async progress({ userId, achievementId }: AchievementRequest) {
    await this.achievementService.progress(userId, achievementId);
  }
}
