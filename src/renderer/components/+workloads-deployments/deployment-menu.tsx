/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { Deployment } from "../../../common/k8s-api/endpoints";
import { deploymentApi } from "../../../common/k8s-api/endpoints";
import { MenuItem } from "../menu";
import { DeploymentScaleDialog } from "./deployment-scale-dialog";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";

export interface DeploymentMenuProps extends KubeObjectMenuProps<Deployment> {}

interface Dependencies {
  openConfirmDialog: OpenConfirmDialog;
}

const NonInjectedDeploymentMenu = ({
  object,
  toolbar,
  openConfirmDialog,
}: Dependencies & DeploymentMenuProps) => (
  <>
    <MenuItem onClick={() => DeploymentScaleDialog.open(object)}>
      <Icon material="open_with" tooltip="Scale" interactive={toolbar}/>
      <span className="title">Scale</span>
    </MenuItem>
    <MenuItem onClick={() => openConfirmDialog({
      ok: async () => {
        try {
          await deploymentApi.restart({
            namespace: object.getNs(),
            name: object.getName(),
          });
        } catch (err) {
          Notifications.error(err);
        }
      },
      labelOk: `Restart`,
      message: (
        <p>
          Are you sure you want to restart deployment <b>{object.getName()}</b>?
        </p>
      ),
    })}>
      <Icon material="autorenew" tooltip="Restart" interactive={toolbar}/>
      <span className="title">Restart</span>
    </MenuItem>
  </>
);

export const DeploymentMenu = withInjectables<Dependencies, DeploymentMenuProps>(NonInjectedDeploymentMenu, {
  getProps: (di, props) => ({
    ...props,
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
  }),
});
