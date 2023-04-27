/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./priority-classes.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { PriorityClass } from "@k8slens/kube-object";

export interface PriorityClassesDetailsProps extends KubeObjectDetailsProps<PriorityClass> {
}

@observer
export class PriorityClassesDetails extends React.Component<PriorityClassesDetailsProps> {

  render() {
    const { object: pc } = this.props;

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
