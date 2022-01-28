/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import portForwardStoreInjectable from "./store.injectable";

const watchPortForwardsInjectable = getInjectable({
  instantiate: (di) => di.inject(portForwardStoreInjectable).watch,
  lifecycle: lifecycleEnum.singleton,
});

export default watchPortForwardsInjectable;
