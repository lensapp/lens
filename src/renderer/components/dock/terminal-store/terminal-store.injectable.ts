/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { TerminalStore } from "./terminal.store";
import createTerminalTabInjectable from "../create-terminal-tab/create-terminal-tab.injectable";
import dockStoreInjectable from "../dock-store/dock-store.injectable";
import createTerminalInjectable from "../terminal/create-terminal.injectable";

const terminalStoreInjectable = getInjectable({
  instantiate: (di) => new TerminalStore({
    createTerminalTab: di.inject(createTerminalTabInjectable),
    dockStore: di.inject(dockStoreInjectable),
    createTerminal: di.inject(createTerminalInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default terminalStoreInjectable;
