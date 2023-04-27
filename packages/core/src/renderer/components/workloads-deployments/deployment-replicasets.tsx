/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./deployment-replicasets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { ReplicaSet } from "@k8slens/kube-object";
import { KubeObjectMenu } from "../kube-object-menu";
import { Spinner } from "../spinner";
import { prevDefault, stopPropagation } from "@k8slens/utilities";
import { DrawerTitle } from "../drawer";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { KubeObjectAge } from "../kube-object/age";
import type { ReplicaSetStore } from "../workloads-replicasets/store";
import type { ShowDetails } from "../kube-detail-params/show-details.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import showDetailsInjectable from "../kube-detail-params/show-details.injectable";
import replicaSetStoreInjectable from "../workloads-replicasets/store.injectable";


enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

interface Dependencies {
  replicaSetStore: ReplicaSetStore;
  showDetails: ShowDetails;
}

export interface DeploymentReplicaSetsProps {
  replicaSets: ReplicaSet[];
}

interface Dependencies {
  replicaSetStore: ReplicaSetStore;
  showDetails: ShowDetails;
}

@observer
class NonInjectedDeploymentReplicaSets extends React.Component<DeploymentReplicaSetsProps & Dependencies> {
  getPodsLength(replicaSet: ReplicaSet) {
    return this.props.replicaSetStore.getChildPods(replicaSet).length;
  }

  render() {
    const {
      replicaSets,
      replicaSetStore,
      showDetails,
    } = this.props;

    if (!replicaSets.length && !replicaSetStore.isLoaded) return (
      <div className="ReplicaSets"><Spinner center/></div>
    );
    if (!replicaSets.length) return null;

    return (
      <div className="ReplicaSets flex column">
        <DrawerTitle>Deploy Revisions</DrawerTitle>
        <Table
          selectable
          tableId="deployment_replica_sets_view"
          scrollable={false}
          sortable={{
            [sortBy.name]: (replicaSet: ReplicaSet) => replicaSet.getName(),
            [sortBy.namespace]: (replicaSet: ReplicaSet) => replicaSet.getNs(),
            [sortBy.age]: (replicaSet: ReplicaSet) => replicaSet.metadata.creationTimestamp,
            [sortBy.pods]: (replicaSet: ReplicaSet) => this.getPodsLength(replicaSet),
          }}
          sortByDefault={{ sortBy: sortBy.pods, orderBy: "desc" }}
          sortSyncWithUrl={false}
          className="box grow"
        >
          <TableHead flat sticky={false}>
            <TableCell className="name" sortBy={sortBy.name}>Name</TableCell>
            <TableCell className="warning"/>
            <TableCell className="namespace" sortBy={sortBy.namespace}>Namespace</TableCell>
            <TableCell className="pods" sortBy={sortBy.pods}>Pods</TableCell>
            <TableCell className="age" sortBy={sortBy.age}>Age</TableCell>
            <TableCell className="actions"/>
          </TableHead>
          {
            replicaSets.map(replica => (
              <TableRow
                key={replica.getId()}
                sortItem={replica}
                nowrap
                onClick={prevDefault(() => showDetails(replica.selfLink, false))}
              >
                <TableCell className="name">{replica.getName()}</TableCell>
                <TableCell className="warning"><KubeObjectStatusIcon key="icon" object={replica} /></TableCell>
                <TableCell className="namespace">{replica.getNs()}</TableCell>
                <TableCell className="pods">{this.getPodsLength(replica)}</TableCell>
                <TableCell className="age"><KubeObjectAge key="age" object={replica} /></TableCell>
                <TableCell className="actions" onClick={stopPropagation}>
                  <KubeObjectMenu object={replica} />
                </TableCell>
              </TableRow>
            ))
          }
        </Table>
      </div>
    );
  }
}

export const DeploymentReplicaSets = withInjectables<Dependencies, DeploymentReplicaSetsProps>(NonInjectedDeploymentReplicaSets, {
  getProps: (di, props) => ({
    ...props,
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    showDetails: di.inject(showDetailsInjectable),
  }),
});
