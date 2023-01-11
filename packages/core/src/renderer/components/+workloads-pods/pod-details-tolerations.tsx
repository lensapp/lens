/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-details-tolerations.scss";
import React from "react";
import { DrawerParamToggler, DrawerItem } from "../drawer";
import type  { Toleration, KubeObject } from "../../../common/k8s-api/kube-object";
import { PodTolerations } from "./pod-tolerations";

export interface KubeObjectWithTolerations extends KubeObject {
  getTolerations(): Toleration[];
}

export interface PodDetailsTolerationsProps {
  workload: KubeObjectWithTolerations;
}

export function PodDetailsTolerations({ workload }: PodDetailsTolerationsProps) {
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
