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

function getTimestampSplitLogs({ logStore }: Dependencies, tabId: string): [string, string][] {
  return logStore.getTimestampSplitLogs(tabId);
}

const getTimestampSplitLogsInjectable = getInjectable({
  instantiate: (di) => bind(getTimestampSplitLogs, null, {
    logStore: di.inject(logStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default getTimestampSplitLogsInjectable;
