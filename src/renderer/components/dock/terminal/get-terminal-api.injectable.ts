/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { TerminalApi } from "../../../api/terminal-api";
import type { TabId } from "../dock/store";
import terminalStoreInjectable from "./store.injectable";

const getTerminalApiInjectable = getInjectable({
  instantiate: (di) => {
    const terminalStore = di.inject(terminalStoreInjectable);

    return (tabId: TabId): TerminalApi => terminalStore.getTerminalApi(tabId);
  },

  lifecycle: lifecycleEnum.singleton,
});

export default getTerminalApiInjectable;
