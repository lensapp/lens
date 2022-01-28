/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { Deployment } from "../../../common/k8s-api/endpoints";

export interface DeploymentScaleDialogState {
  deployment: Deployment | null;
}

const deploymentScaleDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<DeploymentScaleDialogState>({
    deployment: null,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default deploymentScaleDialogStateInjectable;
