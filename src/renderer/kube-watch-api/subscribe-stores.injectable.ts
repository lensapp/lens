/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import kubeWatchApiInjectable from "./kube-watch-api.injectable";

const subscribeStoresInjectable = getInjectable({
  id: "subscribe-stores",
  causesSideEffects: true,
  instantiate: (di) => di.inject(kubeWatchApiInjectable).subscribeStores,
});

export default subscribeStoresInjectable;
