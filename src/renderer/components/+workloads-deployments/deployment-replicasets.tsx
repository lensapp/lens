/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./deployment-replicasets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { KubeObjectMenu } from "../kube-object-menu";
import { Spinner } from "../spinner";
import { prevDefault, stopPropagation } from "../../utils";
import { DrawerTitle } from "../drawer";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { replicaSetStore } from "../+workloads-replicasets/legacy-store";
import { showDetails } from "../kube-detail-params";
import { KubeObjectAge } from "../kube-object/age";


enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

export interface DeploymentReplicaSetsProps {
  replicaSets: ReplicaSet[];
}

@observer
export class DeploymentReplicaSets extends React.Component<DeploymentReplicaSetsProps> {
  getPodsLength(replicaSet: ReplicaSet) {
    return replicaSetStore.getChildPods(replicaSet).length;
  }

  render() {
    const { replicaSets } = this.props;

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
          <TableHead>
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
                  <ReplicaSetMenu object={replica} />
                </TableCell>
              </TableRow>
            ))
          }
        </Table>
      </div>
    );
  }
}

export function ReplicaSetMenu(props: KubeObjectMenuProps<ReplicaSet>) {
  return (
    <KubeObjectMenu {...props}/>
  );
}
