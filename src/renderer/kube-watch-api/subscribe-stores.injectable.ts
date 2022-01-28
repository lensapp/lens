/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import kubeWatchApiInjectable from "./kube-watch-api.injectable";

const subscribeStoresInjectable = getInjectable({
  instantiate: (di) => di.inject(kubeWatchApiInjectable).subscribeStores,
  lifecycle: lifecycleEnum.singleton,
});

export default subscribeStoresInjectable;
