/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import logTabStorageInjectable from "./tab-storage.injectable";
import { LogTabStore } from "./tab-store";

const logTabStoreInjectable = getInjectable({
  instantiate: (di) => new LogTabStore({
    storage: di.inject(logTabStorageInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default logTabStoreInjectable;
