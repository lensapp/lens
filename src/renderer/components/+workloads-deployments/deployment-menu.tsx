/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { Deployment, DeploymentApi } from "../../../common/k8s-api/endpoints";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { ConfirmDialog } from "../confirm-dialog";
import { Notifications } from "../notifications";
import type { OpenDeploymentScaleDialog } from "./scale/open.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import deploymentApiInjectable from "../../../common/k8s-api/endpoints/deployment.api.injectable";
import openDeploymentScaleDialogInjectable from "./scale/open.injectable";

export interface DeploymentMenuProps extends KubeObjectMenuProps<Deployment> {}

interface Dependencies {
  openDeploymentScaleDialog: OpenDeploymentScaleDialog;
  deploymentApi: DeploymentApi;
}

const NonInjectedDeploymentMenu = ({
  deploymentApi,
  object,
  openDeploymentScaleDialog,
  toolbar,
}: Dependencies & DeploymentMenuProps) => (
  <>
    <MenuItem onClick={() => openDeploymentScaleDialog(object)}>
      <Icon
        material="open_with"
        tooltip="Scale"
        interactive={toolbar}
      />
      <span className="title">Scale</span>
    </MenuItem>
    <MenuItem
      onClick={() => ConfirmDialog.open({
        ok: async () =>
        {
          try {
            await deploymentApi.restart({
              namespace: object.getNs(),
              name: object.getName(),
            });
          } catch (err) {
            Notifications.checkedError(err, "Unknown error occured while restarting deployment");
          }
        },
        labelOk: "Restart",
        message: (
          <p>
            {"Are you sure you want to restart deployment "}
            <b>{object.getName()}</b>
            ?
          </p>
        ),
      })}
    >
      <Icon
        material="autorenew"
        tooltip="Restart"
        interactive={toolbar}
      />
      <span className="title">Restart</span>
    </MenuItem>
  </>
);

export const DeploymentMenu = withInjectables<Dependencies, DeploymentMenuProps>(NonInjectedDeploymentMenu, {
  getProps: (di, props) => ({
    ...props,
    deploymentApi: di.inject(deploymentApiInjectable),
    openDeploymentScaleDialog: di.inject(openDeploymentScaleDialogInjectable),
  }),
});
