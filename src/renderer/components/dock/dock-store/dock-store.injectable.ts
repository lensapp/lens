/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { DockStore } from "./dock.store";
import dockStorageInjectable from "./dock-storage/dock-storage.injectable";

const dockStoreInjectable = getInjectable({
  instantiate: (di) =>
    new DockStore({
      storage: di.inject(dockStorageInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default dockStoreInjectable;
