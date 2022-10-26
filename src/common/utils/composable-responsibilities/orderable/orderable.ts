/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { sortBy } from "lodash/fp";

export interface Orderable {
  readonly orderNumber: number;
}

export type MaybeOrderable = Orderable | object;

export const orderByOrderNumber = <T extends MaybeOrderable>(maybeOrderables: T[]) =>
  sortBy(
    (orderable) =>
      "orderNumber" in orderable
        ? orderable.orderNumber
        : Number.MAX_SAFE_INTEGER,
    maybeOrderables,
  );
