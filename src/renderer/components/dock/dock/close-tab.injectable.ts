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

function closeDockTab({ dockStore }: Dependencies, tabId: TabId): void {
  dockStore.closeTab(tabId);
}

const closeDockTabInjectable = getInjectable({
  instantiate: (di) => bind(closeDockTab, null, {
    dockStore: di.inject(dockStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeDockTabInjectable;
