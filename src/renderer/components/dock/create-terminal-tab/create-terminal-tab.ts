/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import {
  DockStore,
  DockTabCreateSpecific,
  TabKind,
} from "../dock-store/dock.store";

interface Dependencies {
  dockStore: DockStore;
}

export const createTerminalTab =
  ({ dockStore }: Dependencies) =>
    (tabParams: DockTabCreateSpecific = {}) =>
      dockStore.createTab({
        title: `Terminal`,
        ...tabParams,
        kind: TabKind.TERMINAL,
      });
