/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Deployment } from "../../../../common/k8s-api/endpoints";
import deploymentScaleDialogStateInjectable from "./dialog-state.injectable";

export type OpenDeploymentScaleDialog = (obj: Deployment) => void;

const openDeploymentScaleDialogInjectable = getInjectable({
  id: "open-deployment-scale-dialog",
  instantiate: (di): OpenDeploymentScaleDialog => {
    const state = di.inject(deploymentScaleDialogStateInjectable);

    return obj => state.set(obj);
  },
});

export default openDeploymentScaleDialogInjectable;
