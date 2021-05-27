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

export class Logger {
  readonly logLevel: LogLevel;
  private readonly logger: pino.Logger;
  constructor(logLevel: LogLevel) {
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
    this.logger[logNameMap[logLevel]]({ message, args });
  }
}
