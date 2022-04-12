/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type RemoveUndefinedFromValues<K> = {
  [P in keyof K]: NonNullable<K[P]>;
};

/**
 * This type helps define which fields of some type will always be defined
 */
export type Defaulted<Params, DefaultParams extends keyof Params> = RemoveUndefinedFromValues<Required<Pick<Params, DefaultParams>>> & Omit<Params, DefaultParams>;

export type OptionVarient<Key, Base, RequiredKey extends keyof Base> = {
  type: Key;
} & Pick<Base, RequiredKey> & {
  [OtherKey in Exclude<keyof Base, RequiredKey>]?: undefined;
};

export type SingleOrMany<T> = T | T[];

export type IfEquals<T, U, Y=unknown, N=never> =
  (<G>() => G extends T ? 1 : 2) extends
  (<G>() => G extends U ? 1 : 2) ? Y : N;
