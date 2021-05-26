import { injectable } from 'tsyringe';

import { AchievementRepository } from '../repositories';
import { Logger } from '../utils';

@injectable()
export class AchievementService {
  constructor(private readonly achievementRepository: AchievementRepository, private readonly logger: Logger) {}
  async progress(userId: UserId, achievementId: AchievementId) {
    const progress = await this.achievementRepository.progress(userId, achievementId);
    return progress;
  }

  async getAll(userId: AchievementId) {
    return this.achievementRepository.getAll(userId);
  }
}
