/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import dockStoreInjectable from "./store.injectable";
import type { DockStore, DockTab, DockTabCreate } from "./store";

interface Dependencies {
  dockStore: DockStore;
}

function createDockTab({ dockStore }: Dependencies, rawTabDesc: DockTabCreate, addNumber?: boolean): DockTab {
  return dockStore.createTab(rawTabDesc, addNumber);
}

const createDockTabInjectable = getInjectable({
  instantiate: (di) => bind(createDockTab, null, {
    dockStore: di.inject(dockStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default createDockTabInjectable;
