/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { DockTabStoreOptions } from "./dock-tab.store";
import { DockTabStore } from "./dock-tab.store";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

const createDockTabStoreInjectable = getInjectable({
  id: "create-dock-tab-store",

  instantiate: (di) => {
    const dependencies = {
      createStorage: di.inject(createStorageInjectable),
    };

    return <T>(options: DockTabStoreOptions = {}) => new DockTabStore<T>(dependencies, options);
  },
});

export default createDockTabStoreInjectable;
