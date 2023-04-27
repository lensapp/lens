/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./replication-controllers.module.scss";
import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import type { ReplicationControllerStore } from "./replication-controller-store";
import { withInjectables } from "@ogre-tools/injectable-react";
import replicationControllerStoreInjectable from "./replication-controller-store.injectable";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";
import { Badge } from "../badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  replicas = "replicas",
  replicasDesired = "replicasDesired",
  selector = "selector",
}

interface Dependencies {
  store: ReplicationControllerStore;
}

const NonInjectedReplicationControllers = observer((props: Dependencies) => (
  <SiblingsInTabLayout>
    <KubeObjectListLayout
      isConfigurable
      tableId="workload_replication_controllers"
      className={styles.ReplicationControllers}
      store={props.store}
      sortingCallbacks={{
        [columnId.name]: item => item.getName(),
        [columnId.namespace]: item => item.getNs(),
        [columnId.selector]: item => item.getSelectorLabels(),
        [columnId.replicas]: item => item.getReplicas(),
        [columnId.replicasDesired]: item => item.getDesiredReplicas(),
      }}
      searchFilters={[
        item => item.getSearchFields(),
        item => item.getSelectorLabels(),
      ]}
      renderHeaderTitle="Replication Controllers"
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
        {
          title: "Namespace",
          className: "namespace",
          sortBy: columnId.namespace,
          id: columnId.namespace,
        },
        { title: "Replicas", sortBy: columnId.replicas, id: columnId.replicas },
        {
          title: "Desired Replicas",
          sortBy: columnId.replicasDesired,
          id: columnId.replicasDesired,
        },
        {
          title: "Selector",
          sortBy: columnId.selector,
          id: columnId.selector,
        },
      ]}
      renderTableContents={item => [
        item.getName(),
        <NamespaceSelectBadge key="namespace" namespace={item.getNs()} />,
        item.getReplicas(),
        item.getDesiredReplicas(),
        item.getSelectorLabels().map(label => (<Badge key={label} label={label} />)),
      ]} />
  </SiblingsInTabLayout>
));

export const ReplicationControllers = withInjectables<Dependencies>(NonInjectedReplicationControllers, {
  getProps: (di, props) => ({
    ...props,
    store: di.inject(replicationControllerStoreInjectable),
  }),
});
