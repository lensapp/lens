/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { PodDisruptionBudget } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";

export interface PodDisruptionBudgetDetailsProps extends KubeObjectDetailsProps<PodDisruptionBudget> {
}

interface Dependencies {

}

const NonInjectedPodDisruptionBudgetDetails = observer(({ object: pdb }: Dependencies & PodDisruptionBudgetDetailsProps) => {
  if (!pdb) {
    return null;
  }

  if (!(pdb instanceof PodDisruptionBudget)) {
    logger.error("[PodDisruptionBudgetDetails]: passed object that is not an instanceof PodDisruptionBudget", pdb);

    return null;
  }

  const selectors = pdb.getSelectors();

  return (
    <div className="PdbDetails">
      <KubeObjectMeta object={pdb}/>

      {selectors.length > 0 &&
          <DrawerItem name="Selector" labelsOnly>
            {
              selectors.map(label => <Badge key={label} label={label}/>)
            }
          </DrawerItem>
      }

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

export const PodDisruptionBudgetDetails = withInjectables<Dependencies, PodDisruptionBudgetDetailsProps>(NonInjectedPodDisruptionBudgetDetails, {
  getProps: (di, props) => ({

    ...props,
  }),
});

