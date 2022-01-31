/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { Deployment, deploymentApi } from "../../../common/k8s-api/endpoints";
import { MenuItem } from "../menu";
import { DeploymentScaleDialog } from "./deployment-scale-dialog";
import { Icon } from "../icon";
import { ConfirmDialog } from "../confirm-dialog";
import { Notifications } from "../notifications";

export function DeploymentMenu(props: KubeObjectMenuProps<Deployment>) {
  const { object, toolbar } = props;

  return (
    <>
      <MenuItem onClick={() => DeploymentScaleDialog.open(object)}>
        <Icon material="open_with" tooltip="Scale" interactive={toolbar}/>
        <span className="title">Scale</span>
      </MenuItem>
      <MenuItem onClick={() => ConfirmDialog.open({
        ok: async () =>
        {
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
}
