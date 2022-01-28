/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { DeploymentStore } from "./store";

const deploymentStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/apis/apps/v1/deployments") as DeploymentStore,
  lifecycle: lifecycleEnum.singleton,
});

export default deploymentStoreInjectable;
