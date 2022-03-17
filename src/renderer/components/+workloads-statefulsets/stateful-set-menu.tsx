/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { StatefulSet } from "../../../common/k8s-api/endpoints";
import { MenuItem } from "../menu";
import { StatefulSetScaleDialog } from "./statefulset-scale-dialog";
import { Icon } from "../icon";

export function StatefulSetMenu(props: KubeObjectMenuProps<StatefulSet>) {
  const { object, toolbar } = props;

  return (
    <>
      <MenuItem onClick={() => StatefulSetScaleDialog.open(object)}>
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
