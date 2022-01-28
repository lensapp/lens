/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import type { Deployment, DeploymentApi } from "../../../common/k8s-api/endpoints";
import deploymentApiInjectable from "../../../common/k8s-api/endpoints/deployment.api.injectable";
import type { ConfirmDialogParams } from "../confirm-dialog";
import openConfirmDialogInjectable from "../confirm-dialog/dialog-open.injectable";
import { Icon } from "../icon";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { MenuItem } from "../menu";
import { Notifications } from "../notifications";
import openDeploymentScaleDialogInjectable from "./scale-dialog-open.injectable";

export interface DeploymentMenuProps extends KubeObjectMenuProps<Deployment> {

}

interface Dependencies {
  openDeploymentScaleDialog: (deployment: Deployment) => void;
  deploymentApi: DeploymentApi;
  openConfirmDialog: (params: ConfirmDialogParams) => void;
}

const NonInjectedDeploymentMenu = observer(({ openDeploymentScaleDialog, openConfirmDialog, deploymentApi, object: deployment, toolbar }: Dependencies & DeploymentMenuProps) => (
  <>
    <MenuItem onClick={() => openDeploymentScaleDialog(deployment)}>
      <Icon material="open_with" tooltip="Scale" interactive={toolbar}/>
      <span className="title">Scale</span>
    </MenuItem>
    <MenuItem onClick={() => openConfirmDialog({
      ok: async () =>
      {
        try {
          await deploymentApi.restart({
            namespace: deployment.getNs(),
            name: deployment.getName(),
          });
        } catch (err) {
          Notifications.error(err);
        }
      },
      labelOk: `Restart`,
      message: (
        <p>
            Are you sure you want to restart deployment <b>{deployment.getName()}</b>?
        </p>
      ),
    })}>
      <Icon material="autorenew" tooltip="Restart" interactive={toolbar}/>
      <span className="title">Restart</span>
    </MenuItem>
  </>
));

export const DeploymentMenu = withInjectables<Dependencies, DeploymentMenuProps>(NonInjectedDeploymentMenu, {
  getProps: (di, props) => ({
    deploymentApi: di.inject(deploymentApiInjectable),
    openDeploymentScaleDialog: di.inject(openDeploymentScaleDialogInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    ...props,
  }),
});
