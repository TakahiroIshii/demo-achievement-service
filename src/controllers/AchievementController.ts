import { injectable } from 'tsyringe';

import { AchievementService } from '../services';
import { Queue } from '../clients/queues';
import { config } from '../../configs';

interface AchievementRequest {
  id: string;
}

@injectable()
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Queue(config.sqs.names.achievementQueue)
  async addTicket({ id }: AchievementRequest) {
    await this.achievementService.add(id);
  }
}
