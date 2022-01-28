/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import type { TabId } from "../dock/store";
import type { LogStore } from "./store";
import logStoreInjectable from "./store.injectable";

interface Dependencies {
  logStore: LogStore;
}

function areLogsPresent({ logStore }: Dependencies, tabId: TabId) {
  return logStore.areLogsPresent(tabId);
}

const areLogsPresentInjectable = getInjectable({
  instantiate: (di) => bind(areLogsPresent, null, {
    logStore: di.inject(logStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default areLogsPresentInjectable;
