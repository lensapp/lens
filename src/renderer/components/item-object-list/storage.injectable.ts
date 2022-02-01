/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";

const itemListLayoutStorageInjectable = getInjectable({
  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    return createStorage("item_list_layout", {
      showFilters: false, // setup defaults
    });
  },

  lifecycle: lifecycleEnum.singleton,
});

export default itemListLayoutStorageInjectable;
