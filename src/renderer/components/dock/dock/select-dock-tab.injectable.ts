/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import type { DockStore, TabId } from "./store";
import dockStoreInjectable from "./store.injectable";

interface Dependencies {
  dockStore: DockStore;
}

function selectDockTab({ dockStore }: Dependencies, tabId: TabId): void {
  dockStore.selectTab(tabId);
}

const selectDockTabInjectable = getInjectable({
  instantiate: (di) => bind(selectDockTab, null, {
    dockStore: di.inject(dockStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default selectDockTabInjectable;
