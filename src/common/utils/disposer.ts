/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type Disposer = () => void;
export interface LibraryDisposers {
  dispose(): void;
}

export interface ExtendableDisposer {
  (): void;
  push(...disposers: (Disposer | LibraryDisposers)[]): void;
}

export function disposer(...args: (Disposer | LibraryDisposers | undefined | null)[]): ExtendableDisposer {
  return Object.assign(() => {
    args.forEach(d => {
      if (typeof d === "function") {
        d();
      } else if (d) {
        d.dispose();
      }
    });
    args.length = 0;
  }, {
    push: (...vals) => args.push(...vals),
  } as Pick<ExtendableDisposer, "push">);
}
