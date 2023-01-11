/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import dockStoreInjectable from "../dock/store.injectable";
import type { DockTabCreateSpecific } from "../dock/store";
import { TabKind } from "../dock/store";

const createTerminalTabInjectable = getInjectable({
  id: "create-terminal-tab",

  instantiate: (di) => {
    const dockStore = di.inject(dockStoreInjectable);

    return (tabParams: DockTabCreateSpecific = {}) =>
      dockStore.createTab({
        title: `Terminal`,
        ...tabParams,
        kind: TabKind.TERMINAL,
      });
  },
});

export default createTerminalTabInjectable;
