/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StorageLayer } from "../../utils";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";

export interface ItemListLayoutState {
  showFilters: boolean;
}

let storage: StorageLayer<ItemListLayoutState>;

const itemListLayoutStorageInjectable = getInjectable({
  setup: async (di) => {
    storage = await di.inject(createStorageInjectable)("item_list_layout", {
      showFilters: false,
    });
  },
  instantiate: () => storage,
  lifecycle: lifecycleEnum.singleton,
});

export default itemListLayoutStorageInjectable ;
