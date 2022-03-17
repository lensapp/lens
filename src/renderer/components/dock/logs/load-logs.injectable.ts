/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { Pod } from "../../../../common/k8s-api/endpoints";
import logStoreInjectable from "./store.injectable";
import type { LogTabData } from "./tab-store";

const loadLogsInjectable = getInjectable({
  id: "load-logs",

  instantiate: (di) => {
    const logStore = di.inject(logStoreInjectable);

    return (
      tabId: string,
      pod: IComputedValue<Pod | undefined>,
      logTabData: IComputedValue<LogTabData | undefined>,
    ): Promise<void> => logStore.load(tabId, pod, logTabData);
  },
});

export default loadLogsInjectable;
