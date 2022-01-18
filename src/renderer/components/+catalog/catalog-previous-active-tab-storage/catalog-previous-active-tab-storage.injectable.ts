/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { browseCatalogTab } from "../../../../common/routes";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

const catalogPreviousActiveTabStorageInjectable = getInjectable({
  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    return createStorage(
      "catalog-previous-active-tab",
      browseCatalogTab,
    );
  },

  lifecycle: lifecycleEnum.singleton,
});

export default catalogPreviousActiveTabStorageInjectable;
