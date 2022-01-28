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

function getTableSortParams({ tableSortData }: Dependencies, tableId: string): Partial<TableSortParams> {
  return tableSortData.get().sortParams[tableId] ?? {};
}

const getTableSortParamsInjectable = getInjectable({
  instantiate: (di) => bind(getTableSortParams, null, {
    tableSortData: di.inject(tableSortStorageInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default getTableSortParamsInjectable;
