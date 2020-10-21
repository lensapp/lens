import "./pod-disruption-budgets.scss"

import * as React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { podDisruptionBudgetsStore } from "./pod-disruption-budgets.store";
import { PodDisruptionBudget, pdbApi } from "../../api/endpoints/poddisruptionbudget.api";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectDetailsProps, KubeObjectListLayout } from "../kube-object";
import { IPodDisruptionBudgetsRouteParams } from "./pod-disruption-budgets.route";
import { apiManager } from "../../api/api-manager";

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
        renderHeaderTitle={<Trans>Pod Disruption Budgets</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Min Available</Trans>, className: "min-available", sortBy: sortBy.minAvailable },
          { title: <Trans>Max Unavailable</Trans>, className: "max-unavailable", sortBy: sortBy.maxUnavailable },
          { title: <Trans>Current Healthy</Trans>, className: "current-healthy", sortBy: sortBy.currentHealthy },
          { title: <Trans>Desired Healthy</Trans>, className: "desired-healthy", sortBy: sortBy.desiredHealthy },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(pdb: PodDisruptionBudget) => {
          return [
            pdb.getName(),
            pdb.getNs(),
            pdb.getMinAvailable(),
            pdb.getMaxUnavailable(),
            pdb.getCurrentHealthy(),
            pdb.getDesiredHealthy(),
            pdb.getAge(),
          ]
        }}
      />
    );
  }
}
