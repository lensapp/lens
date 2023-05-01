/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./priority-classes.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { PriorityClass } from "@k8slens/kube-object";

@observer
export class PriorityClassesDetails extends React.Component<KubeObjectDetailsProps> {
  render() {
    const { object: pc } = this.props;

    if (!pc) {
      return null;
    }

    if (!(pc instanceof PriorityClass)) {
      return null;
    }

    return (
      <div className="PriorityClassesDetails">
        <DrawerItem name="Description">
          {pc.getDescription()}
        </DrawerItem>

        <DrawerItem name="Value">
          {pc.getValue()}
        </DrawerItem>

        <DrawerItem name="Global Default">
          {pc.getGlobalDefault()}
        </DrawerItem>
      </div>
    );
  }
}
