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

export const PriorityClassesDetails = observer((props: KubeObjectDetailsProps) => {
  const priorityClass = props.object as PriorityClass;

  return (
    <div className="PriorityClassesDetails">
      <DrawerItem name="Description">
        {priorityClass.getDescription()}
      </DrawerItem>

      <DrawerItem name="Value">
        {priorityClass.getValue()}
      </DrawerItem>

      <DrawerItem name="Global Default">
        {priorityClass.getGlobalDefault()}
      </DrawerItem>
    </div>
  );
});
