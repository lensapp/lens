/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { ServiceAccount } from "../../../common/k8s-api/endpoints";
import { Icon } from "../icon";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { openServiceAccountKubeConfig } from "../kubeconfig-dialog";
import { MenuItem } from "../menu";

export function ServiceAccountMenu(props: KubeObjectMenuProps<ServiceAccount>) {
  const { object, toolbar } = props;

  return (
    <MenuItem onClick={() => openServiceAccountKubeConfig(object)}>
      <Icon material="insert_drive_file" tooltip="Kubeconfig File" interactive={toolbar} />
      <span className="title">Kubeconfig</span>
    </MenuItem>
  );
}
