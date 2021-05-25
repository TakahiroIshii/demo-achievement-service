import { Operator } from 'dynamo-types/dst/query';
import { singleton } from 'tsyringe';

import { Achievement, DataTypePrefixes } from '../models';
import { BaseRepository } from './BaseRepository';

@singleton()
export class AchievementRepository extends BaseRepository {
  private readonly expiry = 730;
  private readonly threshold = 2;
  async init() {
    const metadata = Achievement.metadata;
    try {
      await metadata.connection.client.describeTable({ TableName: Achievement.metadata.name }).promise();
    } catch (err) {
      if (err.name == 'ResourceNotFoundException') {
        await Achievement.createTable();
        return;
      }
      throw err;
    }
  }

  async dropTable() {
    await Achievement.dropTable();
  }

  async progress(userId: UserId, achievementId: AchievementId) {
    const rangeKey = `${DataTypePrefixes.progress}${achievementId}`;
    const result = await Achievement.primaryKey.query({
      hash: userId,
      range: ['=', `${DataTypePrefixes.progress}${achievementId}`],
    });
    const [progress] = result.records;
    if (progress != null) {
      await Achievement.primaryKey.update(userId, rangeKey, {
        progress: ['ADD', 1],
        meta: ['PUT', { lastProgress: Date.now() }],
      });
      const updateResult = await Achievement.primaryKey.get(userId, rangeKey);
      if (updateResult!.progress > this.threshold) {
        await this.createAchievement(userId, achievementId);
      }
      return updateResult;
    }
    return this.createProgress(userId, achievementId);
  }

  async createAchievement(userId: UserId, achievementId: AchievementId) {
    const achievement = new Achievement();
    achievement.userId = userId;
    achievement.dataId = `${DataTypePrefixes.achievement}${achievementId}`;
    achievement.expiresAt = Date.now() + this.expiry * 60 * 60 * 1000;
    achievement.meta = {
      achievedAt: Date.now(),
    };
    try {
      await Achievement.writer.put(achievement, {
        condition: { expiresAt: new Operator('attributeNotExists', 0, false) },
      });
    } catch (err) {
      if (err.code === 'ConditionalCheckFailedException') {
        return;
      }
      throw err;
    }
  }

  async createProgress(userId: UserId, achievementId: AchievementId) {
    const now = Date.now();
    const achievementProgress = new Achievement();
    achievementProgress.userId = userId;
    achievementProgress.dataId = `${DataTypePrefixes.progress}${achievementId}`;
    achievementProgress.expiresAt = now + this.expiry * 60 * 60 * 1000;
    achievementProgress.meta = {
      lastProgress: now,
    };
    achievementProgress.progress = 1;
    return Achievement.writer.put(achievementProgress);
  }

  async getAll(userId: Achievement['userId']) {
    const { records } = await Achievement.primaryKey.query({
      hash: userId,
      range: ['beginsWith', DataTypePrefixes.achievement],
    });
    return records;
  }
}
