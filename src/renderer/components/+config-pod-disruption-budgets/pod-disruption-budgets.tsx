import "./pod-disruption-budgets.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { podDisruptionBudgetsStore } from "./pod-disruption-budgets.store";
import { PodDisruptionBudget } from "../../api/endpoints/poddisruptionbudget.api";
import { KubeObjectDetailsProps, KubeObjectListLayout } from "../kube-object";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum sortBy {
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
        className="PodDisruptionBudgets"
        store={podDisruptionBudgetsStore}
        sortingCallbacks={{
          [sortBy.name]: (pdb: PodDisruptionBudget) => pdb.getName(),
          [sortBy.namespace]: (pdb: PodDisruptionBudget) => pdb.getNs(),
          [sortBy.minAvailable]: (pdb: PodDisruptionBudget) => pdb.getMinAvailable(),
          [sortBy.maxUnavailable]: (pdb: PodDisruptionBudget) => pdb.getMaxUnavailable(),
          [sortBy.currentHealthy]: (pdb: PodDisruptionBudget) => pdb.getCurrentHealthy(),
          [sortBy.desiredHealthy]: (pdb: PodDisruptionBudget) => pdb.getDesiredHealthy(),
          [sortBy.age]: (pdb: PodDisruptionBudget) => pdb.getAge(),
        }}
        searchFilters={[
          (pdb: PodDisruptionBudget) => pdb.getSearchFields(),
        ]}
        renderHeaderTitle="Pod Disruption Budgets"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Min Available", className: "min-available", sortBy: sortBy.minAvailable },
          { title: "Max Unavailable", className: "max-unavailable", sortBy: sortBy.maxUnavailable },
          { title: "Current Healthy", className: "current-healthy", sortBy: sortBy.currentHealthy },
          { title: "Desired Healthy", className: "desired-healthy", sortBy: sortBy.desiredHealthy },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(pdb: PodDisruptionBudget) => {
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
