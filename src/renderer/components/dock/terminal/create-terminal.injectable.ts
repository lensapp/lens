/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { Terminal } from "./terminal";
import type { TabId } from "../dock-store/dock.store";
import type { TerminalApi } from "../../../api/terminal-api";
import dockStoreInjectable from "../dock-store/dock-store.injectable";

const createTerminalInjectable = getInjectable({
  instantiate: (di) => {
    const dependencies = {
      dockStore: di.inject(dockStoreInjectable),
    };

    return (tabId: TabId, api: TerminalApi) =>
      new Terminal(dependencies, tabId, api);
  },

  lifecycle: lifecycleEnum.singleton,
});

export default createTerminalInjectable;
