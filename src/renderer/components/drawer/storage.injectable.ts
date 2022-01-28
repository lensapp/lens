/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StorageLayer } from "../../utils";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";

export const defaultDrawerWidth = 725;

export interface DrawerState {
  width: number;
}

let storage: StorageLayer<DrawerState>;

const drawerStorageInjectable = getInjectable({
  setup: async (di) => {
    storage = await di.inject(createStorageInjectable)("drawer", {
      width: defaultDrawerWidth,
    });
  },
  instantiate: () => storage,
  lifecycle: lifecycleEnum.singleton,
});

export default drawerStorageInjectable;
