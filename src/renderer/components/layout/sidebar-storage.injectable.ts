/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StorageLayer } from "../../utils";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";

export interface SidebarStorageState {
  width: number;
  expanded: Record<string, boolean | undefined>;
}

export const defaultSidebarWidth = 200;

let storage: StorageLayer<SidebarStorageState>;

const sidebarStorageInjectable = getInjectable({
  setup: async (di) => {
    storage = await di.inject(createStorageInjectable)("sidebar", {
      width: defaultSidebarWidth,
      expanded: {},
    });
  },
  instantiate: () => storage,
  lifecycle: lifecycleEnum.singleton,
});

export default sidebarStorageInjectable;
