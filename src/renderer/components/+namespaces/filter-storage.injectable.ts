/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StorageLayer } from "../../utils";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";

let storage: StorageLayer<string[] | undefined>;

const namespaceSelectFilterStorageInjectable = getInjectable({
  setup: async (di) => {
    storage = await di.inject(createStorageInjectable)("selected_namespaces", undefined);
  },
  instantiate: () => storage,
  lifecycle: lifecycleEnum.singleton,
});

export default namespaceSelectFilterStorageInjectable;
