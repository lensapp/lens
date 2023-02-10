/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./replicationcontrollers.module.scss";
import React from "react";
import { observer } from "mobx-react";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import type { ReplicationControllerStore } from "./replicationctrl-store";
import type { EventStore } from "../+events/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import eventStoreInjectable from "../+events/store.injectable";
import replicationControllerStoreInjectable from "./replicationctrl-store.injectable";
import { NamespaceSelectBadge } from "../+namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
}

interface Dependencies {
  store: ReplicationControllerStore;
  eventStore: EventStore;
}

const NonInjectedReplicationControllers = observer((props: Dependencies) => {
  const {
    eventStore,
    store,
  } = props;

  return (
    <SiblingsInTabLayout>
      <KubeObjectListLayout
        isConfigurable
        tableId="workload_replicationcontrollers"
        className={styles.ReplicationControllers}
        store={store}
        dependentStores={[eventStore]} // status icon component uses event store
        sortingCallbacks={{
          [columnId.name]: replicaSet => replicaSet.getName(),
          [columnId.namespace]: replicaSet => replicaSet.getNs(),
        }}
        searchFilters={[
          replicaSet => replicaSet.getSearchFields(),
        ]}
        renderHeaderTitle="Replica Sets"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          {
            title: "Namespace",
            className: "namespace",
            sortBy: columnId.namespace,
            id: columnId.namespace,
          },
        ]}
        renderTableContents={replicaSet => [
          replicaSet.getName(),
          <KubeObjectStatusIcon key="icon" object={replicaSet} />,
          <NamespaceSelectBadge
            key="namespace"
            namespace={replicaSet.getNs()}
          />,
        ]}
      />
    </SiblingsInTabLayout>
  );
});

export const ReplicationControllers = withInjectables<Dependencies>(NonInjectedReplicationControllers, {
  getProps: (di, props) => ({
    ...props,
    eventStore: di.inject(eventStoreInjectable),
    store: di.inject(replicationControllerStoreInjectable),
  }),
});
