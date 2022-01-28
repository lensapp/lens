/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { browseCatalogTab } from "../../../common/routes";
import type { StorageLayer } from "../../utils";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";

let storage: StorageLayer<string>;

const catalogPreviousActiveTabInjectable = getInjectable({
  setup: async (di) => {
    storage = await di.inject(createStorageInjectable)("catalog-previous-active-tab", browseCatalogTab);
  },
  instantiate: () => storage,
  lifecycle: lifecycleEnum.singleton,
});

export default catalogPreviousActiveTabInjectable;
