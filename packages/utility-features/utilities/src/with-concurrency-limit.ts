/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import pLimit from "p-limit";

export type ConcurrencyLimiter = <Args extends any[], Res>(fn: (...args: Args) => Res) => (...args: Args) => Promise<Res>;

export function withConcurrencyLimit(limit: number): ConcurrencyLimiter {
  const limiter = pLimit(limit);

  return fn => (...args) => limiter(() => fn(...args));
}
