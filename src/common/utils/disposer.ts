/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type Disposer = () => void;

interface Extendable<T> {
  push(...vals: T[]): void;
}

export type ExtendableDisposer = Disposer & Extendable<Disposer>;

export function disposer(...args: (Disposer | undefined | null)[]): ExtendableDisposer {
  const res = () => {
    args.forEach(dispose => dispose?.());
    args.length = 0;
  };

  res.push = (...vals: Disposer[]) => {
    args.push(...vals);
  };

  return res;
}
