/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { OpenReplicaSetScaleDialog } from "./scale-dialog/open.injectable";
import openReplicaSetScaleDialogInjectable from "./scale-dialog/open.injectable";

export interface ReplicaSetMenuProps extends KubeObjectMenuProps<ReplicaSet> {

}

interface Dependencies {
  openReplicaSetScaleDialog: OpenReplicaSetScaleDialog;
}

const NonInjectedReplicaSetMenu = ({
  object,
  toolbar,
  openReplicaSetScaleDialog,
}: Dependencies & ReplicaSetMenuProps) => (
  <>
    <MenuItem onClick={() => openReplicaSetScaleDialog(object)}>
      <Icon
        material="open_with"
        tooltip="Scale"
        interactive={toolbar}
      />
      <span className="title">Scale</span>
    </MenuItem>
  </>
);

export const ReplicaSetMenu = withInjectables<Dependencies, ReplicaSetMenuProps>(NonInjectedReplicaSetMenu, {
  getProps: (di, props) => ({
    ...props,
    openReplicaSetScaleDialog: di.inject(openReplicaSetScaleDialogInjectable),
  }),
});
