/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";

const itemListLayoutStorageInjectable = getInjectable({
  id: "item-list-layout-storage",

  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    return createStorage("item_list_layout", {
      showFilters: false, // setup defaults
    });
  },
});

export default itemListLayoutStorageInjectable;
