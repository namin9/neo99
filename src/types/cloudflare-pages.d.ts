type Awaitable<T> = T | Promise<T>;

declare type PagesFunction<Env = unknown> = (context: {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil(promise: Promise<unknown>): void;
}) => Awaitable<Response>;
