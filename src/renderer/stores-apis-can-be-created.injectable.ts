/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { storesAndApisCanBeCreatedInjectionToken } from "../common/k8s-api/stores-apis-can-be-created.token";
import hostedClusterIdInjectable from "./cluster-frame-context/hosted-cluster-id.injectable";

const storesAndApisCanBeCreatedInjectable = getInjectable({
  id: "create-stores-and-apis",

  instantiate: (di) => {
    const hostedClusterId = di.inject(hostedClusterIdInjectable);

    return !!hostedClusterId;
  },

  injectionToken: storesAndApisCanBeCreatedInjectionToken,
});

export default storesAndApisCanBeCreatedInjectable;
