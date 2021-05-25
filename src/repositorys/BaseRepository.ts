export abstract class BaseRepository {
  abstract init(): Promise<void>;
  abstract dropTable(): Promise<void>;
}
