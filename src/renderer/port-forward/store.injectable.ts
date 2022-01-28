/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import portForwardStorageInjectable from "./storage.injectable";
import { PortForwardStore } from "./store";

const portForwardStoreInjectable = getInjectable({
  instantiate: (di) => new PortForwardStore({
    storage: di.inject(portForwardStorageInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default portForwardStoreInjectable;
