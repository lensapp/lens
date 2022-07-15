/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./priority-classes.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { PriorityClass } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";

export interface PriorityClassesDetailsProps extends KubeObjectDetailsProps<PriorityClass> {
}

@observer
export class PriorityClassesDetails extends React.Component<PriorityClassesDetailsProps> {

  render() {
    const { object: pc } = this.props;

    if (!pc) {
      return null;
    }

    if (!(pc instanceof PriorityClass)) {
      logger.error("[PriorityClassesDetails]: passed object that is not an instanceof PriorityClass", pc);

      return null;
    }

    return (
      <div className="PriorityClassesDetails">
        <KubeObjectMeta object={pc} />

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
