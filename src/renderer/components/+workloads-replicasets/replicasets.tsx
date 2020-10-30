import "./replicasets.scss";

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { ReplicaSet, replicaSetApi } from "../../api/endpoints";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { replicaSetStore } from "./replicasets.store";
import { Spinner } from "../spinner";
import { prevDefault, stopPropagation } from "../../utils";
import { DrawerTitle } from "../drawer";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { showDetails } from "../../navigation";
import { apiManager } from "../../api/api-manager";

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
export class ReplicaSets extends React.Component<Props> {
  private sortingCallbacks = {
    [sortBy.name]: (replicaSet: ReplicaSet) => replicaSet.getName(),
    [sortBy.namespace]: (replicaSet: ReplicaSet) => replicaSet.getNs(),
    [sortBy.age]: (replicaSet: ReplicaSet) => replicaSet.metadata.creationTimestamp,
    [sortBy.pods]: (replicaSet: ReplicaSet) => this.getPodsLength(replicaSet),
  }

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
        <DrawerTitle title={<Trans>Deploy Revisions</Trans>}/>
        <Table
          selectable
          scrollable={false}
          sortable={this.sortingCallbacks}
          sortByDefault={{ sortBy: sortBy.pods, orderBy: "desc" }}
          sortSyncWithUrl={false}
          className="box grow"
        >
          <TableHead>
            <TableCell className="name" sortBy={sortBy.name}><Trans>Name</Trans></TableCell>
            <TableCell className="namespace" sortBy={sortBy.namespace}>Namespace</TableCell>
            <TableCell className="pods" sortBy={sortBy.pods}><Trans>Pods</Trans></TableCell>
            <TableCell className="age" sortBy={sortBy.age}><Trans>Age</Trans></TableCell>
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
                  <TableCell className="namespace">{replica.getNs()}</TableCell>
                  <TableCell className="pods">{this.getPodsLength(replica)}</TableCell>
                  <TableCell className="age">{replica.getAge()}</TableCell>
                  <TableCell className="actions" onClick={stopPropagation}>
                    <ReplicaSetMenu object={replica}/>
                  </TableCell>
                </TableRow>
              )
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
  )
}
