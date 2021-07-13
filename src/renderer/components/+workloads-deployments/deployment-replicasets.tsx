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

import "./deployment-replicasets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { ReplicaSet } from "../../api/endpoints";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { Spinner } from "../spinner";
import { prevDefault, stopPropagation } from "../../utils";
import { DrawerTitle } from "../drawer";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { showDetails } from "../kube-object";


enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

interface Props {
  replicaSets: ReplicaSet[];
}

@observer
export class DeploymentReplicaSets extends React.Component<Props> {
  private sortingCallbacks = {
    [sortBy.name]: (replicaSet: ReplicaSet) => replicaSet.getName(),
    [sortBy.namespace]: (replicaSet: ReplicaSet) => replicaSet.getNs(),
    [sortBy.age]: (replicaSet: ReplicaSet) => replicaSet.metadata.creationTimestamp,
    [sortBy.pods]: (replicaSet: ReplicaSet) => this.getPodsLength(replicaSet),
  };

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
        <DrawerTitle title="Deploy Revisions"/>
        <Table
          selectable
          tableId="deployment-replicasets-details-list"
          scrollable={false}
          sortable={this.sortingCallbacks}
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
                  <TableCell className="pods">{this.getPodsLength(replica)}</TableCell>
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
  }
}

export function ReplicaSetMenu(props: KubeObjectMenuProps<ReplicaSet>) {
  return (
    <KubeObjectMenu {...props}/>
  );
}
