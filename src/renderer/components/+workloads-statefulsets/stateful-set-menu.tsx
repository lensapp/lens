/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { StatefulSet } from "../../../common/k8s-api/endpoints";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import type { OpenStatefulSetDialog } from "./dialog/open.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import openStatefulSetDialogInjectable from "./dialog/open.injectable";

export interface StatefulSetMenuProps extends KubeObjectMenuProps<StatefulSet> {}

interface Dependencies {
  openStatefulSetDialog: OpenStatefulSetDialog;
}

const NonInjectedStatefulSetMenu = ({ object, toolbar, openStatefulSetDialog }: Dependencies & StatefulSetMenuProps) => (
  <>
    <MenuItem onClick={() => openStatefulSetDialog(object)}>
      <Icon
        material="open_with"
        tooltip="Scale"
        interactive={toolbar}
      />
      <span className="title">Scale</span>
    </MenuItem>
  </>
);

export const StatefulSetMenu = withInjectables<Dependencies, StatefulSetMenuProps>(NonInjectedStatefulSetMenu, {
  getProps: (di, props) => ({
    ...props,
    openStatefulSetDialog: di.inject(openStatefulSetDialogInjectable),
  }),
});
