/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { daemonSetStore } from "./daemonsets.store";

const daemonsetsStoreInjectable = getInjectable({
  id: "daemonsets-store",
  instantiate: () => daemonSetStore,
  causesSideEffects: true,
});

export default daemonsetsStoreInjectable;

