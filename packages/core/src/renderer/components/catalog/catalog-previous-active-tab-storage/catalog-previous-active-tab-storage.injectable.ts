/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";
import { browseCatalogTab } from "../catalog-browse-tab";

const catalogPreviousActiveTabStorageInjectable = getInjectable({
  id: "catalog-previous-active-tab-storage",

  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    return createStorage<string | null>(
      "catalog-previous-active-tab",
      browseCatalogTab,
    );
  },
});

export default catalogPreviousActiveTabStorageInjectable;
