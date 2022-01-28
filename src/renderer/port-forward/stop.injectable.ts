/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import portForwardStoreInjectable from "./store.injectable";

const stopPortForwardInjectable = getInjectable({
  instantiate: (di) => di.inject(portForwardStoreInjectable).stopPortForward,
  lifecycle: lifecycleEnum.singleton,
});

export default stopPortForwardInjectable;
