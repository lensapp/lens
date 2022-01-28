/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints";
import { Icon } from "../icon";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { MenuItem } from "../menu";
import openReplicaSetScaleDialogInjectable from "./scale-dialog-open.injectable";

export interface ReplicaSetMenuProps extends KubeObjectMenuProps<ReplicaSet> {

}

interface Dependencies {
  openReplicaSetScaleDialog: (replicaSet: ReplicaSet) => void;
}

const NonInjectedReplicaSetMenu = observer(({ openReplicaSetScaleDialog, toolbar, object: replicaSet }: Dependencies & ReplicaSetMenuProps) => (
  <>
    <MenuItem onClick={() => openReplicaSetScaleDialog(replicaSet)}>
      <Icon material="open_with" tooltip="Scale" interactive={toolbar}/>
      <span className="title">Scale</span>
    </MenuItem>
  </>
));

export const ReplicaSetMenu = withInjectables<Dependencies, ReplicaSetMenuProps>(NonInjectedReplicaSetMenu, {
  getProps: (di, props) => ({
    openReplicaSetScaleDialog: di.inject(openReplicaSetScaleDialogInjectable),
    ...props,
  }),
});
