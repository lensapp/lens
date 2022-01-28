/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind, StorageLayer } from "../../utils";
import tableSortStorageInjectable from "./storage.injectable";
import type { TableStorageModel } from "./storage.model";
import type { TableSortParams } from "./table";

interface Dependencies {
  tableSortData: StorageLayer<TableStorageModel>;
}

function setTableSortParams({ tableSortData }: Dependencies, tableId: string, data: Partial<TableSortParams>): void {
  tableSortData.merge(draft => {
    draft.sortParams[tableId] = data;
  });
}

const setTableSortParamsInjectable = getInjectable({
  instantiate: (di) => bind(setTableSortParams, null, {
    tableSortData: di.inject(tableSortStorageInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default setTableSortParamsInjectable;
