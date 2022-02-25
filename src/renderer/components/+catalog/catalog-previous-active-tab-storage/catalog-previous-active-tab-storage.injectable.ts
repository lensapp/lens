/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { browseCatalogTab } from "../../../../common/routes";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

const catalogPreviousActiveTabStorageInjectable = getInjectable({
  id: "catalog-previous-active-tab-storage",

  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    return createStorage(
      "catalog-previous-active-tab",
      browseCatalogTab,
    );
  },
});

export default catalogPreviousActiveTabStorageInjectable;
