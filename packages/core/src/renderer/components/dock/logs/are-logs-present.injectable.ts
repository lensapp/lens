/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { TabId } from "../dock/store";
import logStoreInjectable from "./store.injectable";

const areLogsPresentInjectable = getInjectable({
  id: "are-logs-present",

  instantiate: (di) => {
    const logStore = di.inject(logStoreInjectable);

    return (tabId: TabId) => logStore.areLogsPresent(tabId);
  },
});

export default areLogsPresentInjectable;
