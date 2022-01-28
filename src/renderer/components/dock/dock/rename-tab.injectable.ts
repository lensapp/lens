/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import dockStoreInjectable from "./store.injectable";
import type { DockStore, TabId } from "./store";

interface Dependencies {
  dockStore: DockStore;
}

function renameTab({ dockStore }: Dependencies, tabId: TabId, title: string): void {
  dockStore.renameTab(tabId, title);
}

const renameTabInjectable = getInjectable({
  instantiate: (di) => bind(renameTab, null, {
    dockStore: di.inject(dockStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default renameTabInjectable;
