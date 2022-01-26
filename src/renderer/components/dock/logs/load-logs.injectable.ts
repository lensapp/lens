/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import { bind } from "../../../utils";
import type { LogStore } from "./store";
import logStoreInjectable from "./store.injectable";
import type { LogTabData } from "./tab-store";

interface Dependencies {
  logStore: LogStore;
}

function loadLogs({ logStore }: Dependencies, tabId: string, pod: IComputedValue<Pod | undefined>, logTabData: IComputedValue<LogTabData>): Promise<void> {
  return logStore.load(tabId, pod, logTabData);
}

const loadLogsInjectable = getInjectable({
  instantiate: (di) => bind(loadLogs, null, {
    logStore: di.inject(logStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default loadLogsInjectable;
