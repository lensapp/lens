/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { StorageLayer } from "../../../utils";
import type { TableSortParams } from "../table";

export interface TableStorageModel {
  sortParams: {
    [tableId: string]: Partial<TableSortParams>;
  };
}

interface Dependencies {
  storage: StorageLayer<TableStorageModel>;
}

export class TableModel {
  constructor(private dependencies: Dependencies) {}

  getSortParams = (tableId: string): Partial<TableSortParams> =>
    this.dependencies.storage.get().sortParams[tableId];

  setSortParams = (
    tableId: string,
    sortParams: Partial<TableSortParams>,
  ): void => {
    this.dependencies.storage.merge((draft) => {
      draft.sortParams[tableId] = sortParams;
    });
  };
}
