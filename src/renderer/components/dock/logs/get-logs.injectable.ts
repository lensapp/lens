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

function getLogs({ logStore }: Dependencies, tabId: string): string[] {
  return logStore.getLogs(tabId);
}

const getLogsInjectable = getInjectable({
  instantiate: (di) => bind(getLogs, null, {
    logStore: di.inject(logStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default getLogsInjectable;
