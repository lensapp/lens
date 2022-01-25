/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import dockStoreInjectable from "../dock/store.injectable";
import { DockStore, DockTabCreateSpecific, TabKind } from "../dock/store";
import { bind } from "../../../utils";

interface Dependencies {
  dockStore: DockStore;
}

export function createTerminalTab({ dockStore }: Dependencies, tabParams: DockTabCreateSpecific = {}) {
  return dockStore.createTab({
    title: `Terminal`,
    ...tabParams,
    kind: TabKind.TERMINAL,
  });
}

const createTerminalTabInjectable = getInjectable({
  instantiate: (di) => bind(createTerminalTab, null, {
    dockStore: di.inject(dockStoreInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createTerminalTabInjectable;
