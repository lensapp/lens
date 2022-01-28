/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StorageLayer } from "../../../utils";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";
import type { DockTabStorageState } from "../dock-tab/store";

let storage: StorageLayer<DockTabStorageState<string>>;

const createResourceTabStorageInjectable = getInjectable({
  setup: async (di) => {
    storage = await di.inject(createStorageInjectable)("create_resource", {});
  },
  instantiate: () => storage,
  lifecycle: lifecycleEnum.singleton,
});

export default createResourceTabStorageInjectable;
