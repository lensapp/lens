import "./pod-disruption-budgets.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { podDisruptionBudgetsStore } from "./pod-disruption-budgets.store";
import { PodDisruptionBudget } from "../../api/endpoints/poddisruptionbudget.api";
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
          [columnId.name]: (pdb: PodDisruptionBudget) => pdb.getName(),
          [columnId.namespace]: (pdb: PodDisruptionBudget) => pdb.getNs(),
          [columnId.minAvailable]: (pdb: PodDisruptionBudget) => pdb.getMinAvailable(),
          [columnId.maxUnavailable]: (pdb: PodDisruptionBudget) => pdb.getMaxUnavailable(),
          [columnId.currentHealthy]: (pdb: PodDisruptionBudget) => pdb.getCurrentHealthy(),
          [columnId.desiredHealthy]: (pdb: PodDisruptionBudget) => pdb.getDesiredHealthy(),
          [columnId.age]: (pdb: PodDisruptionBudget) => pdb.getAge(),
        }}
        searchFilters={[
          (pdb: PodDisruptionBudget) => pdb.getSearchFields(),
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
