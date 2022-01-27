/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import logStoreInjectable from "./store.injectable";

const getTimestampSplitLogsInjectable = getInjectable({
  instantiate: (di) => di.inject(logStoreInjectable).getTimestampSplitLogsByTabId,
  lifecycle: lifecycleEnum.singleton,
});

export default getTimestampSplitLogsInjectable;
