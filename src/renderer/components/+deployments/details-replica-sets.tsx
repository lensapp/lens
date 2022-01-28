/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details-replica-sets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object-menu";
import { Spinner } from "../spinner";
import { prevDefault, stopPropagation } from "../../utils";
import { DrawerTitle } from "../drawer";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { ReplicaSetStore } from "../+replica-sets/store";
import { showDetails } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import replicaSetStoreInjectable from "../+replica-sets/store.injectable";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

export interface DeploymentReplicaSetsProps {
  replicaSets: ReplicaSet[];
}

interface Dependencies {
  replicaSetStore: ReplicaSetStore;
}

const NonInjectedDeploymentReplicaSets = observer(({ replicaSetStore, replicaSets }: Dependencies & DeploymentReplicaSetsProps) => {
  const getPodsLength = (replicaSet: ReplicaSet) => {
    return replicaSetStore.getChildPods(replicaSet).length;
  };

  if (replicaSets.length === 0) {
    return replicaSetStore.isLoaded && (
      <div className="ReplicaSets">
        <Spinner center/>
      </div>
    );
  }

  return (
    <div className="ReplicaSets flex column">
      <DrawerTitle title="Deploy Revisions"/>
      <Table
        selectable
        tableId="deployment_replica_sets_view"
        scrollable={false}
        sortable={{
          [sortBy.name]: (replicaSet: ReplicaSet) => replicaSet.getName(),
          [sortBy.namespace]: (replicaSet: ReplicaSet) => replicaSet.getNs(),
          [sortBy.age]: (replicaSet: ReplicaSet) => replicaSet.metadata.creationTimestamp,
          [sortBy.pods]: (replicaSet: ReplicaSet) => getPodsLength(replicaSet),
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
          replicaSets.map(replica => {
            return (
              <TableRow
                key={replica.getId()}
                sortItem={replica}
                nowrap
                onClick={prevDefault(() => showDetails(replica.selfLink, false))}
              >
                <TableCell className="name">{replica.getName()}</TableCell>
                <TableCell className="warning"><KubeObjectStatusIcon key="icon" object={replica}/></TableCell>
                <TableCell className="namespace">{replica.getNs()}</TableCell>
                <TableCell className="pods">{getPodsLength(replica)}</TableCell>
                <TableCell className="age">{replica.getAge()}</TableCell>
                <TableCell className="actions" onClick={stopPropagation}>
                  <ReplicaSetMenu object={replica}/>
                </TableCell>
              </TableRow>
            );
          })
        }
      </Table>
    </div>
  );
});

export const DeploymentReplicaSets = withInjectables<Dependencies, DeploymentReplicaSetsProps>(NonInjectedDeploymentReplicaSets, {
  getProps: (di, props) => ({
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    ...props,
  }),
});

export function ReplicaSetMenu(props: KubeObjectMenuProps<ReplicaSet>) {
  return (
    <KubeObjectMenu {...props}/>
  );
}
