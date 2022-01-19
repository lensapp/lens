/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createTerminalTab } from "./create-terminal-tab";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import dockStoreInjectable from "../dock-store/dock-store.injectable";

const createTerminalTabInjectable = getInjectable({
  instantiate: (di) => createTerminalTab({
    dockStore: di.inject(dockStoreInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createTerminalTabInjectable;
