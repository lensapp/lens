/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { sortBy } from "lodash/fp";

export interface Orderable {
  orderNumber: number;
}

export const orderByOrderNumber = <T extends Orderable | {}>(maybeOrderables: T[]) =>
  sortBy(
    (orderable) =>
      "orderNumber" in orderable
        ? orderable.orderNumber
        : Number.MAX_SAFE_INTEGER,
    maybeOrderables,
  );
