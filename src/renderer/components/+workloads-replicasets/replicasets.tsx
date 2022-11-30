/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./replicasets.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { ReplicaSetStore } from "./store";
import type { EventStore } from "../+events/store";
import type { FilterByNamespace } from "../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import { prevDefault } from "../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import eventStoreInjectable from "../+events/store.injectable";
import filterByNamespaceInjectable from "../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import replicaSetStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  desired = "desired",
  current = "current",
  ready = "ready",
  age = "age",
}

interface Dependencies {
  replicaSetStore: ReplicaSetStore;
  eventStore: EventStore;
  filterByNamespace: FilterByNamespace;
}

@observer
class NonInjectedReplicaSets extends React.Component<Dependencies> {
  render() {
    const {
      eventStore,
      filterByNamespace,
      replicaSetStore,
    } = this.props;

    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="workload_replicasets"
          className="ReplicaSets"
          store={replicaSetStore}
          dependentStores={[eventStore]} // status icon component uses event store
          sortingCallbacks={{
            [columnId.name]: replicaSet => replicaSet.getName(),
            [columnId.namespace]: replicaSet => replicaSet.getNs(),
            [columnId.desired]: replicaSet => replicaSet.getDesired(),
            [columnId.current]: replicaSet => replicaSet.getCurrent(),
            [columnId.ready]: replicaSet => replicaSet.getReady(),
            [columnId.age]: replicaSet => -replicaSet.getCreationTimestamp(),
          }}
          searchFilters={[
            replicaSet => replicaSet.getSearchFields(),
          ]}
          renderHeaderTitle="Replica Sets"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Desired", className: "desired", sortBy: columnId.desired, id: columnId.desired },
            { title: "Current", className: "current", sortBy: columnId.current, id: columnId.current },
            { title: "Ready", className: "ready", sortBy: columnId.ready, id: columnId.ready },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={replicaSet => [
            replicaSet.getName(),
            <KubeObjectStatusIcon key="icon" object={replicaSet} />,
            <a
              key="namespace"
              className="filterNamespace"
              onClick={prevDefault(() => filterByNamespace(replicaSet.getNs()))}
            >
              {replicaSet.getNs()}
            </a>,
            replicaSet.getDesired(),
            replicaSet.getCurrent(),
            replicaSet.getReady(),
            <KubeObjectAge key="age" object={replicaSet} />,
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const ReplicaSets = withInjectables<Dependencies>(NonInjectedReplicaSets, {
  getProps: (di, props) => ({
    ...props,
    eventStore: di.inject(eventStoreInjectable),
    filterByNamespace: di.inject(filterByNamespaceInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
  }),
});
