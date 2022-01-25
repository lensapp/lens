/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import type { LogStore } from "./store";
import logStoreInjectable from "./store.injectable";

interface Dependencies {
  logStore: LogStore;
}

function stopLoadingLogs({ logStore }: Dependencies, tabId: string): void {
  return logStore.stopLoadingLogs(tabId);
}

const stopLoadingLogsInjectable = getInjectable({
  instantiate: (di) => bind(stopLoadingLogs, null, {
    logStore: di.inject(logStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default stopLoadingLogsInjectable;
