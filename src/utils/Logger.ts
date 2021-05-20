import * as pino from 'pino';

export enum LogLevel {
  Debug = 20,
  Info = 30,
  Warn = 40,
  Error = 50,
}

const logNameMap: Record<LogLevel, string> = {
  [LogLevel.Debug]: 'debug',
  [LogLevel.Info]: 'info',
  [LogLevel.Warn]: 'warn',
  [LogLevel.Error]: 'error',
};

interface ILogger {
  logLevel: LogLevel;
}

export class Logger implements ILogger {
  readonly logLevel: LogLevel;
  private readonly logger: pino.Logger;
  constructor({ logLevel }: ILogger) {
    this.logLevel = logLevel;
    this.logger = pino({ level: logNameMap[logLevel] });
  }

  debug = (message: string, ...data: any[]) => {
    this.log(LogLevel.Debug, message, data);
  };

  info = (message: string, ...data: any[]) => {
    this.log(LogLevel.Info, message, data);
  };

  warn = (message: string, ...data: any[]) => {
    this.log(LogLevel.Warn, message, data);
  };

  error = (message: string, ...data: any[]) => {
    this.log(LogLevel.Error, message, data);
  };

  private log(logLevel: LogLevel, message: string, args: any[]) {
    if (logLevel < this.logLevel) {
      return;
    }
    const error = args.find((arg) => arg instanceof Error);
    const stack = logLevel !== LogLevel.Error ? undefined : error?.stack ?? new Error().stack;
    const err = error?.message;
    args = args.filter((arg) => arg !== error);
    const data = args.length <= 1 ? { ...args[0], err } : { args, err };
    this.logger[logNameMap[logLevel]]({ message, stack, data });
  }
}
