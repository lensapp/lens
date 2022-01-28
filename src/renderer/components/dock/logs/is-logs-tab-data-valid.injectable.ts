/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import type { TabId } from "../dock/store";
import type { LogTabStore } from "./tab-store";
import logTabStoreInjectable from "./tab-store.injectable";

interface Dependencies {
  logTabStore: LogTabStore;
}

function isLogsTabDataValid({ logTabStore }: Dependencies, tabId: TabId) {
  return logTabStore.isDataValid(tabId);
}

const isLogsTabDataValidInjectable = getInjectable({
  instantiate: (di) => bind(isLogsTabDataValid, null, {
    logTabStore: di.inject(logTabStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default isLogsTabDataValidInjectable;
