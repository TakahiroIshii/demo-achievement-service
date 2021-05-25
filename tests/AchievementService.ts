import * as assert from 'assert';
import { container } from 'tsyringe';

import { AchievementService } from '../src/services';
import { DataTypePrefixes } from '../src/models';

describe('AchievementService', () => {
  const achievementService = container.resolve(AchievementService);
  const userId = 'testUser';
  const testAchievementId = 'testAchievementId';
  describe('progress', () => {
    it('should make progress', async () => {
      const progress = await achievementService.progress(userId, testAchievementId);

      assert.ok(progress);
      assert.strictEqual(progress.progress, 1);
    });
    it('should make progress on top of existing progress', async () => {
      const progress = await achievementService.progress(userId, testAchievementId);
      assert.ok(progress);
      assert.strictEqual(progress.progress, 2);
    });
  });

  describe('getAll', () => {
    it('should be able to get all achievements for the user', async () => {
      const achievements = await achievementService.getAll(userId);
      assert.strictEqual(achievements.length, 1);
      const [achievement] = achievements;
      assert.strictEqual(achievement.dataId, `${DataTypePrefixes.achievement}${testAchievementId}`);
    });
  });
});
