/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { deploymentStore } from "./deployments.store";

const deploymentsStoreInjectable = getInjectable({
  id: "deployments-store",
  instantiate: () => deploymentStore,
  causesSideEffects: true,
});

export default deploymentsStoreInjectable;
