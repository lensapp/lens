/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import podStoreInjectable from "./store.injectable";

const getPodsByOwnerIdInjectable = getInjectable({
  instantiate: (di) => di.inject(podStoreInjectable).getPodsByOwnerId,
  lifecycle: lifecycleEnum.singleton,
});

export default getPodsByOwnerIdInjectable;
