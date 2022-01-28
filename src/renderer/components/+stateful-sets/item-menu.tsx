/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import type { StatefulSet } from "../../../common/k8s-api/endpoints";
import { Icon } from "../icon";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { MenuItem } from "../menu";
import openStatefulSetScaleDialogInjectable from "./scale-dialog-open.injectable";

export interface StatefulSetMenuProps extends KubeObjectMenuProps<StatefulSet> {}

interface Dependencies {
  openStatefulSetScaleDialog: (statefuleSet: StatefulSet) => void;
}

const NonInjectedStatefulSetMenu = observer(({ openStatefulSetScaleDialog, toolbar, object: statefuleSet }: Dependencies & StatefulSetMenuProps) => (
  <MenuItem onClick={() => openStatefulSetScaleDialog(statefuleSet)}>
    <Icon material="open_with" tooltip="Scale" interactive={toolbar}/>
    <span className="title">Scale</span>
  </MenuItem>
));

export const StatefulSetMenu = withInjectables<Dependencies, StatefulSetMenuProps>(NonInjectedStatefulSetMenu, {
  getProps: (di, props) => ({
    openStatefulSetScaleDialog: di.inject(openStatefulSetScaleDialogInjectable),
    ...props,
  }),
});
