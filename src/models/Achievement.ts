import { Decorator, Query, Table } from 'dynamo-types';
import { DynamoDBConnection } from 'dynamo-types/dst/connections';

import { config } from '../../configs';

@Decorator.Table({ name: `${config.dynamo.prefix}achievement`, connection: new DynamoDBConnection(config.dynamo) })
export class Achievement extends Table {
  @Decorator.Attribute()
  public userId: string;

  @Decorator.Attribute()
  public dataId: string;

  @Decorator.Attribute({ timeToLive: true })
  public expiresAt: number;

  @Decorator.Attribute()
  public meta: Meta;

  @Decorator.Attribute()
  public progress: number;

  @Decorator.FullPrimaryKey('userId', 'dataId')
  static readonly primaryKey: Query.FullPrimaryKey<Achievement, string, string>;

  @Decorator.Writer()
  static readonly writer: Query.Writer<Achievement>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Meta {}

export interface AchievementMeta extends Meta {
  achievedAt: number;
}

export interface ProgressMeta extends Meta {
  lastProgress: number;
}

export enum DataTypePrefixes {
  achievement = 'achievement_',
  progress = 'progress_',
}
