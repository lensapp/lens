/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { TableSortParams } from "./table";

export interface TableStorageModel {
  sortParams: Record<string, Partial<TableSortParams> | undefined>;
}
