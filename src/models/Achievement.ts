import { Decorator, Query, Table } from 'dynamo-types';
import { DynamoDBConnection } from 'dynamo-types/dst/connections';

import { config } from '../../configs';

@Decorator.Table({ name: 'achievement', connection: new DynamoDBConnection(config.dynamo) })
export class Achievement extends Table {
  @Decorator.Attribute()
  public id: number;

  @Decorator.Attribute()
  public title: string;

  @Decorator.Attribute({ timeToLive: true })
  public expiresAt: number;

  @Decorator.FullPrimaryKey('id', 'title')
  static readonly primaryKey: Query.FullPrimaryKey<Achievement, number, string>;

  @Decorator.Writer()
  static readonly writer: Query.Writer<Achievement>;
}
