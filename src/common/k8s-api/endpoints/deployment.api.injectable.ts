/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { DeploymentApi } from "./deployment.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const deploymentApiInjectable = getInjectable({
  id: "deployment-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "deploymentApi is only available in certain environments");

    return new DeploymentApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default deploymentApiInjectable;
