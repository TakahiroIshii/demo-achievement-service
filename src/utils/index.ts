import { container } from 'tsyringe';

import { Logger } from './Logger';

type PromiseOrAsync<T> = Promise<T> | (() => Promise<T>);

function defaultErrorHandler(err: Error) {
  container.resolve(Logger).error('run async error', err);
}

export type FunctionName<T> = T extends new (...args: any[]) => infer R ? keyof R : never;
export function runAsync<T>(handler: PromiseOrAsync<T>, errorHandler: (err: Error) => void = defaultErrorHandler) {
  try {
    const promise = typeof handler === 'function' ? handler() : handler;
    promise.catch(errorHandler);
  } catch (err) {
    errorHandler(err);
  }
}

export * from './Logger';
