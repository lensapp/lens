/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A Channel represent an link that renderer can request on, given some
 * parameters, and get a value back
 */
export type Channel<Parameters extends any[], Value> = (...args: Parameters) => Promise<Value>;

export type ChannelValue<T> = T extends Channel<any, infer Value>
  ? Value
  : never;

export type ChannelParameters<T> = T extends Channel<infer Parameters, any>
  ? Parameters
  : never;
