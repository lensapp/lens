/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { LogStore } from "./store";
import callForLogsInjectable from "./call-for-logs.injectable";

const logStoreInjectable = getInjectable({
  instantiate: (di) => new LogStore({
    callForLogs: di.inject(callForLogsInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default logStoreInjectable;
