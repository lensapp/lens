/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StorageLayer } from "../../utils";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";
import type { TableStorageModel } from "./storage.model";

let storage: StorageLayer<TableStorageModel>;

const tableSortStorageInjectable = getInjectable({
  setup: async (di) => {
    storage = await di.inject(createStorageInjectable)("table_settings", {
      sortParams: {},
    });
  },
  instantiate: () => storage,
  lifecycle: lifecycleEnum.singleton,
});

export default tableSortStorageInjectable;
