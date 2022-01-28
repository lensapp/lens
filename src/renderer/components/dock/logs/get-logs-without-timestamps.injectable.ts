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

function getLogsWithoutTimestamps({ logStore }: Dependencies, tabId: string): string[] {
  return logStore.getLogsWithoutTimestamps(tabId);
}

const getLogsWithoutTimestampsInjectable = getInjectable({
  instantiate: (di) => bind(getLogsWithoutTimestamps, null, {
    logStore: di.inject(logStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default getLogsWithoutTimestampsInjectable;
