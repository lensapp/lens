/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../utils";
import type { DeploymentScaleDialogState } from "./scale-dialog.state.injectable";
import deploymentScaleDialogStateInjectable from "./scale-dialog.state.injectable";

interface Dependencies {
  deploymentScaleDialogState: DeploymentScaleDialogState;
}

function closeDeploymentScaleDialog({ deploymentScaleDialogState }: Dependencies): void {
  deploymentScaleDialogState.deployment = null;
}

const closeDeploymentScaleDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeDeploymentScaleDialog, null, {
    deploymentScaleDialogState: di.inject(deploymentScaleDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeDeploymentScaleDialogInjectable;
