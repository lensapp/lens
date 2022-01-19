/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { LogStore } from "./log.store";
import logTabStoreInjectable from "../log-tab-store/log-tab-store.injectable";
import dockStoreInjectable from "../dock-store/dock-store.injectable";
import callForLogsInjectable from "./call-for-logs/call-for-logs.injectable";

const logStoreInjectable = getInjectable({
  instantiate: (di) => new LogStore({
    logTabStore: di.inject(logTabStoreInjectable),
    dockStore: di.inject(dockStoreInjectable),
    callForLogs: di.inject(callForLogsInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default logStoreInjectable;
