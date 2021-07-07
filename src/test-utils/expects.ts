/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { inspect } from "util";

export interface OnlyOnce {
  (value: any): void;
  allSatisfied(): void;
}

export function expectInSetOnce(set: Set<any>): OnlyOnce {
  const alreadySeen = new Set();
  const haventSeen = new Set(set);

  return Object.assign(
    (value: any) => {
      if (haventSeen.has(value)) {
        haventSeen.delete(value);
        alreadySeen.add(value);
      } else if (alreadySeen.has(value)) {
        throw new Error(`Expected ${inspect(value)} only once`);
      } else {
        throw new Error(`Unexpected value ${inspect(value)}`);
      }
    },
    {
      allSatisfied: () => {
        if (haventSeen.size) {
          throw new Error(`${haventSeen.size} items not seen`);
        }
      },
    },
  );
}
