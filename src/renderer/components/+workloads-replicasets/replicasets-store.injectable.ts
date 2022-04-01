/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { replicaSetStore } from "./replicasets.store";

const replicasetsStoreInjectable = getInjectable({
  id: "replicasets-store",
  instantiate: () => replicaSetStore,
  causesSideEffects: true,
});

export default replicasetsStoreInjectable;
