/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StorageLayer } from "../../../utils";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";
import type { DockTabStorageState } from "../dock-tab/store";
import type { EditingResource } from "./store";

let storage: StorageLayer<DockTabStorageState<EditingResource>>;

const editResourceTabStorageInjectable = getInjectable({
  setup: async (di) => {
    storage = await di.inject(createStorageInjectable)("edit_resource_store", {});
  },
  instantiate: () => storage,
  lifecycle: lifecycleEnum.singleton,
});

export default editResourceTabStorageInjectable;
