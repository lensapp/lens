/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import type { LogTabData, LogTabStore } from "./tab-store";
import logTabStoreInjectable from "./tab-store.injectable";

interface Dependencies {
  logTabStore: LogTabStore;
}

function setLogTabData({ logTabStore }: Dependencies, tabId: string, data: LogTabData): void {
  return logTabStore.setData(tabId, data);
}

const setLogTabDataInjectable = getInjectable({
  instantiate: (di) => bind(setLogTabData, null, {
    logTabStore: di.inject(logTabStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default setLogTabDataInjectable;
