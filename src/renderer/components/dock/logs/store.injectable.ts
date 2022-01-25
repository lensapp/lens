/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { LogStore } from "./store";
import callForLogsInjectable from "./call-for-logs.injectable";
import { podsStore } from "../../+workloads-pods/pods.store";

const logStoreInjectable = getInjectable({
  instantiate: (di) => new LogStore({
    callForLogs: di.inject(callForLogsInjectable),
    getPodById: id => podsStore.getById(id),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default logStoreInjectable;
