import { singleton } from 'tsyringe';

import { Achievement } from '../models';

@singleton()
export class AchievementRepository {
  async init() {
    const metadata = Achievement.metadata;
    try {
      await metadata.connection.client.describeTable({ TableName: Achievement.metadata.name }).promise();
    } catch (err) {
      if (err.name == 'ResourceNotFoundException') {
        await Achievement.createTable();
        const achievement = new Achievement();
        achievement.id = 100;
        achievement.title = 'Title';
        await Achievement.writer.put(achievement);
      }
    }
  }
}
