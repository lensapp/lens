/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints";
import { MenuItem } from "../menu";
import { ReplicaSetScaleDialog } from "./replicaset-scale-dialog";
import { Icon } from "../icon";

export function ReplicaSetMenu(props: KubeObjectMenuProps<ReplicaSet>) {
  const { object, toolbar } = props;

  return (
    <>
      <MenuItem onClick={() => ReplicaSetScaleDialog.open(object)}>
        <Icon
          material="open_with"
          tooltip="Scale"
          interactive={toolbar}
        />
        <span className="title">Scale</span>
      </MenuItem>
    </>
  );
}
