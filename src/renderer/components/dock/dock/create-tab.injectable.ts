/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import dockStoreInjectable from "./store.injectable";
import type { DockStore, DockTabData, DockTabCreate, DockTabCreateOptions } from "./store";

interface Dependencies {
  dockStore: DockStore;
}

function createDockTab({ dockStore }: Dependencies, rawTabDesc: DockTabCreate, opts?: DockTabCreateOptions): DockTabData {
  return dockStore.createTab(rawTabDesc, opts);
}

const createDockTabInjectable = getInjectable({
  instantiate: (di) => bind(createDockTab, null, {
    dockStore: di.inject(dockStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default createDockTabInjectable;
