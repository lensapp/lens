/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type SafeCapitalize<S> = S extends string
  ? Capitalize<S>
  : never;

export type PrefixCamelCasedProperties<Value, Prefix extends string> = Value extends Function
	? Value
    : Value extends Array<any>
      ? Value
      : {
        [K in keyof Value as `${Prefix}${SafeCapitalize<K>}`]: Value[K];
      };
