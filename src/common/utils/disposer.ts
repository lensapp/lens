/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type Disposer = () => void;

interface Extendable<T> {
  push(...vals: T[]): void;
}

export type ExtendableDisposer = Disposer & Extendable<Disposer>;

export function disposer(...disposers: Disposer[]): ExtendableDisposer {
  const res = () => {
    for (const disposer of disposers) {
      disposer();
    }
    disposers.length = 0;
  };

  res.push = (...vals: Disposer[]) => {
    disposers.push(...vals);
  };

  return res;
}
