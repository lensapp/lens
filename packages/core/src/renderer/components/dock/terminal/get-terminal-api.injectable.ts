/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { TabId } from "../dock/store";
import terminalStoreInjectable from "./store.injectable";

const getTerminalApiInjectable = getInjectable({
  id: "get-terminal-api",

  instantiate: (di) => {
    const terminalStore = di.inject(terminalStoreInjectable);

    return (tabId: TabId) => terminalStore.getTerminalApi(tabId);
  },
});

export default getTerminalApiInjectable;
