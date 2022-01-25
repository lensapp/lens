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

function clearLogTabData({ logTabStore }: Dependencies, tabId: TabId): void {
  logTabStore.clearData(tabId);
}

const clearLogTabDataInjectable = getInjectable({
  instantiate: (di) => bind(clearLogTabData, null, {
    logTabStore: di.inject(logTabStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default clearLogTabDataInjectable;
