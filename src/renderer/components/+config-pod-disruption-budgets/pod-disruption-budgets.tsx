/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-disruption-budgets.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { podDisruptionBudgetStore } from "./legacy-store";
import type { PodDisruptionBudget } from "../../../common/k8s-api/endpoints/pod-disruption-budget.api";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";

enum columnId {
  name = "name",
  namespace = "namespace",
  minAvailable = "min-available",
  maxUnavailable = "max-unavailable",
  currentHealthy = "current-healthy",
  desiredHealthy = "desired-healthy",
  age = "age",
}

export interface PodDisruptionBudgetsProps extends KubeObjectDetailsProps<PodDisruptionBudget> {
}

@observer
export class PodDisruptionBudgets extends React.Component<PodDisruptionBudgetsProps> {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="configuration_distribution_budgets"
          className="PodDisruptionBudgets"
          store={podDisruptionBudgetStore}
          sortingCallbacks={{
            [columnId.name]: pdb => pdb.getName(),
            [columnId.namespace]: pdb => pdb.getNs(),
            [columnId.minAvailable]: pdb => pdb.getMinAvailable(),
            [columnId.maxUnavailable]: pdb => pdb.getMaxUnavailable(),
            [columnId.currentHealthy]: pdb => pdb.getCurrentHealthy(),
            [columnId.desiredHealthy]: pdb => pdb.getDesiredHealthy(),
            [columnId.age]: pdb => -pdb.getCreationTimestamp(),
          }}
          searchFilters={[
            pdb => pdb.getSearchFields(),
          ]}
          renderHeaderTitle="Pod Disruption Budgets"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Min Available", className: "min-available", sortBy: columnId.minAvailable, id: columnId.minAvailable },
            { title: "Max Unavailable", className: "max-unavailable", sortBy: columnId.maxUnavailable, id: columnId.maxUnavailable },
            { title: "Current Healthy", className: "current-healthy", sortBy: columnId.currentHealthy, id: columnId.currentHealthy },
            { title: "Desired Healthy", className: "desired-healthy", sortBy: columnId.desiredHealthy, id: columnId.desiredHealthy },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={pdb => [
            pdb.getName(),
            <KubeObjectStatusIcon key="icon" object={pdb} />,
            pdb.getNs(),
            pdb.getMinAvailable(),
            pdb.getMaxUnavailable(),
            pdb.getCurrentHealthy(),
            pdb.getDesiredHealthy(),
            <KubeObjectAge key="age" object={pdb} />,
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}
