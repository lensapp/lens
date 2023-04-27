/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./runtime-classes-details-tolerations.scss";
import React from "react";
import { DrawerParamToggler, DrawerItem } from "../drawer";
import type { Toleration, KubeObject } from "@k8slens/kube-object";
import { RuntimeClassTolerations } from "./runtime-classes-tolerations";

export interface KubeObjectWithTolerations extends KubeObject {
  getTolerations(): Toleration[];
}

export interface RuntimeClassDetailsTolerationsProps {
  runtimeClass: KubeObjectWithTolerations;
}

export function RuntimeClassDetailsTolerations({ runtimeClass: runtimeClass }: RuntimeClassDetailsTolerationsProps) {
  const tolerations = runtimeClass.getTolerations();

  if (!tolerations.length) return null;

  return (
    <DrawerItem name="Tolerations" className="RuntimeClassDetailsTolerations">
      <DrawerParamToggler label={tolerations.length}>
        <RuntimeClassTolerations tolerations={tolerations} />
      </DrawerParamToggler>
    </DrawerItem>
  );
}
