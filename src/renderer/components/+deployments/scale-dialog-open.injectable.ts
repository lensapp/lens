/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Deployment } from "../../../common/k8s-api/endpoints";
import { bind } from "../../utils";
import type { DeploymentScaleDialogState } from "./scale-dialog.state.injectable";
import deploymentScaleDialogStateInjectable from "./scale-dialog.state.injectable";

interface Dependencies {
  deploymentScaleDialogState: DeploymentScaleDialogState;
}

function openDeploymentScaleDialog({ deploymentScaleDialogState }: Dependencies, deployment: Deployment): void {
  deploymentScaleDialogState.deployment = deployment;
}

const openDeploymentScaleDialogInjectable = getInjectable({
  instantiate: (di) => bind(openDeploymentScaleDialog, null, {
    deploymentScaleDialogState: di.inject(deploymentScaleDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openDeploymentScaleDialogInjectable;
