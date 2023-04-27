/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./runtime-classes.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { RuntimeClass } from "@k8slens/kube-object";
import { Badge } from "../badge";
import { RuntimeClassDetailsTolerations } from "./runtime-classes-details-tolerations";

export interface RuntimeClassesDetailsProps extends KubeObjectDetailsProps<RuntimeClass> {
}

@observer
export class RuntimeClassesDetails extends React.Component<RuntimeClassesDetailsProps> {

  render() {
    const { object: rc } = this.props;
    const nodeSelector = rc.getNodeSelectors();

    return (
      <div className="RuntimeClassesDetails">
        <DrawerItem name="Handler">
          {rc.getHandler()}
        </DrawerItem>

        <DrawerItem name="Pod Fixed" hidden={rc.getPodFixed() === ""}>
          {rc.getPodFixed()}
        </DrawerItem>

        <DrawerItem name="Node Selector" hidden={nodeSelector.length === 0}>
          {nodeSelector.map(label => <Badge key={label} label={label} />)}
        </DrawerItem>

        <RuntimeClassDetailsTolerations runtimeClass={rc} />

      </div>
    );
  }
}
