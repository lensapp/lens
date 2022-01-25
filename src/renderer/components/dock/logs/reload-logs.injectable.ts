/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { bind } from "../../../utils";
import type { LogStore } from "./store";
import logStoreInjectable from "./store.injectable";
import type { LogTabData } from "./tab-store";

interface Dependencies {
  logStore: LogStore;
}

function reloadLogs({ logStore }: Dependencies, tabId: string, logTabData: IComputedValue<LogTabData>): Promise<void> {
  return logStore.reload(tabId, logTabData);
}

const reloadLogsInjectable = getInjectable({
  instantiate: (di) => bind(reloadLogs, null, {
    logStore: di.inject(logStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default reloadLogsInjectable;
