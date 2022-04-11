/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./daemonsets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { DaemonSet } from "../../../common/k8s-api/endpoints";
import { eventStore } from "../+events/event.store";
import { daemonSetStore } from "./legacy-store";
import { podStore } from "../+workloads-pods/legacy-store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { Badge } from "../badge";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  labels = "labels",
  age = "age",
}

@observer
export class DaemonSets extends React.Component {
  getPodsLength(daemonSet: DaemonSet) {
    return daemonSetStore.getChildPods(daemonSet).length;
  }

  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="workload_daemonsets"
          className="DaemonSets"
          store={daemonSetStore}
          dependentStores={[podStore, eventStore]} // status icon component uses event store
          sortingCallbacks={{
            [columnId.name]: daemonSet => daemonSet.getName(),
            [columnId.namespace]: daemonSet => daemonSet.getNs(),
            [columnId.pods]: daemonSet => this.getPodsLength(daemonSet),
            [columnId.age]: daemonSet => -daemonSet.getCreationTimestamp(),
          }}
          searchFilters={[
            daemonSet => daemonSet.getSearchFields(),
            daemonSet => daemonSet.getLabels(),
          ]}
          renderHeaderTitle="Daemon Sets"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Pods", className: "pods", sortBy: columnId.pods, id: columnId.pods },
            { className: "warning", showWithColumn: columnId.pods },
            { title: "Node Selector", className: "labels scrollable", id: columnId.labels },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={daemonSet => [
            daemonSet.getName(),
            daemonSet.getNs(),
            this.getPodsLength(daemonSet),
            <KubeObjectStatusIcon key="icon" object={daemonSet} />,
            daemonSet.getNodeSelectors().map(selector => (
              <Badge
                key={selector}
                label={selector}
                scrollable
              />
            )),
            <KubeObjectAge key="age" object={daemonSet} />,
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}
