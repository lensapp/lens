/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";

type GetMockedType<T> =
  T extends (...args: any[]) => Promise<any>
    ? AsyncFnMock<T>
    : T extends (...args: any[]) => any
      ? jest.MockedFunction<T>
      : T;

export type Mocked<T extends object> = {
  -readonly [P in keyof T]: GetMockedType<T[P]>;
};
