/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-disruption-budgets-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { PodDisruptionBudget } from "@k8slens/kube-object";

export interface PodDisruptionBudgetDetailsProps extends KubeObjectDetailsProps<PodDisruptionBudget> {
}

export const PodDisruptionBudgetDetails = observer((props: PodDisruptionBudgetDetailsProps) => {
  const { object: pdb } = props;

  if (!pdb) {
    return null;
  }

  const selectors = pdb.getSelectors();

  return (
    <div className="PdbDetails">
      {selectors.length > 0 && (
        <DrawerItem name="Selector" labelsOnly>
          {selectors.map(label => <Badge key={label} label={label}/>)}
        </DrawerItem>
      )}

      <DrawerItem name="Min Available">
        {pdb.getMinAvailable()}
      </DrawerItem>

      <DrawerItem name="Max Unavailable">
        {pdb.getMaxUnavailable()}
      </DrawerItem>

      <DrawerItem name="Current Healthy">
        {pdb.getCurrentHealthy()}
      </DrawerItem>

      <DrawerItem name="Desired Healthy">
        {pdb.getDesiredHealthy()}
      </DrawerItem>

    </div>
  );
});
