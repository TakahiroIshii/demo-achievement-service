/* import-sort-ignore */
import * as dotenv from 'dotenv';
import * as path from 'path';
import '../src/clients';
import '../src/services';
import '../src/repositories';
import { Logger, LogLevel } from '../src/utils';
import { container } from 'tsyringe';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

const logger = new Logger({ logLevel: LogLevel.Debug });
container.register(Logger, { useValue: logger });
