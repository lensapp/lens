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
import { PodDisruptionBudget } from "../../../common/k8s-api/endpoints";
import type { Logger } from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import loggerInjectable from "../../../common/logger.injectable";

export interface PodDisruptionBudgetDetailsProps extends KubeObjectDetailsProps<PodDisruptionBudget> {
}

interface Dependencies {
  logger: Logger;
}

@observer
class NonInjectedPodDisruptionBudgetDetails extends React.Component<PodDisruptionBudgetDetailsProps & Dependencies> {

  render() {
    const { object: pdb } = this.props;

    if (!pdb) {
      return null;
    }

    if (!(pdb instanceof PodDisruptionBudget)) {
      this.props.logger.error("[PodDisruptionBudgetDetails]: passed object that is not an instanceof PodDisruptionBudget", pdb);

      return null;
    }

    const selectors = pdb.getSelectors();

    return (
      <div className="PdbDetails">
        {selectors.length > 0 && (
          <DrawerItem name="Selector" labelsOnly>
            {
              selectors.map(label => <Badge key={label} label={label}/>)
            }
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
  }
}

export const PodDisruptionBudgetDetails = withInjectables<Dependencies, PodDisruptionBudgetDetailsProps>(NonInjectedPodDisruptionBudgetDetails, {
  getProps: (di, props) => ({
    ...props,
    logger: di.inject(loggerInjectable),
  }),
});
