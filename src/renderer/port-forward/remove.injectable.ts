/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import portForwardStoreInjectable from "./store.injectable";

const removePortForwardInjectable = getInjectable({
  instantiate: (di) => di.inject(portForwardStoreInjectable).removePortForward,
  lifecycle: lifecycleEnum.singleton,
});

export default removePortForwardInjectable;
