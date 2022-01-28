/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details-tolerations.scss";
import React from "react";
import { DrawerParamToggler, DrawerItem } from "../drawer";
import type  { WorkloadKubeObject } from "../../../common/k8s-api/workload-kube-object";
import { PodTolerations } from "./tolerations";

interface Props {
  workload: WorkloadKubeObject;
}

export class PodDetailsTolerations extends React.Component<Props> {
  render() {
    const { workload } = this.props;
    const tolerations = workload.getTolerations();

    if (!tolerations.length) return null;

    return (
      <DrawerItem name="Tolerations" className="PodDetailsTolerations">
        <DrawerParamToggler label={tolerations.length}>
          <PodTolerations tolerations={tolerations} />
        </DrawerParamToggler>
      </DrawerItem>
    );
  }
}
