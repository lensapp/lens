/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./pod-disruption-budgets.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { podDisruptionBudgetsStore } from "./pod-disruption-budgets.store";
import type { PodDisruptionBudget } from "../../api/endpoints/poddisruptionbudget.api";
import { KubeObjectDetailsProps, KubeObjectListLayout } from "../kube-object";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  namespace = "namespace",
  minAvailable = "min-available",
  maxUnavailable = "max-unavailable",
  currentHealthy = "current-healthy",
  desiredHealthy = "desired-healthy",
  age = "age",
}

interface Props extends KubeObjectDetailsProps<PodDisruptionBudget> {
}

@observer
export class PodDisruptionBudgets extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="configuration_distribution_budgets"
        className="PodDisruptionBudgets"
        store={podDisruptionBudgetsStore}
        sortingCallbacks={{
          [columnId.name]: pdb => pdb.getName(),
          [columnId.namespace]: pdb => pdb.getNs(),
          [columnId.minAvailable]: pdb => pdb.getMinAvailable(),
          [columnId.maxUnavailable]: pdb => pdb.getMaxUnavailable(),
          [columnId.currentHealthy]: pdb => pdb.getCurrentHealthy(),
          [columnId.desiredHealthy]: pdb => pdb.getDesiredHealthy(),
          [columnId.age]: pdb => pdb.getAge(),
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
        renderTableContents={pdb => {
          return [
            pdb.getName(),
            <KubeObjectStatusIcon key="icon" object={pdb} />,
            pdb.getNs(),
            pdb.getMinAvailable(),
            pdb.getMaxUnavailable(),
            pdb.getCurrentHealthy(),
            pdb.getDesiredHealthy(),
            pdb.getAge(),
          ];
        }}
      />
    );
  }
}
