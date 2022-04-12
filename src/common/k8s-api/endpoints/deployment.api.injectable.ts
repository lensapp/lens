/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { DeploymentApi } from "./deployment.api";

const deploymentApiInjectable = getInjectable({
  id: "deployment-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "deploymentApi is only available in certain environments");

    return new DeploymentApi();
  },
});

export default deploymentApiInjectable;
