/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pods.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { EventStore } from "../events/store";
import type { PodStore } from "./store";
import eventStoreInjectable from "../events/store.injectable";
import podStoreInjectable from "./store.injectable";

interface Dependencies {
  eventStore: EventStore;
  podStore: PodStore;
}

@observer
class NonInjectedPods extends React.Component<Dependencies> {
  render() {
    const { podStore, eventStore } = this.props;

    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          className="Pods"
          store={podStore}
          dependentStores={[eventStore]} // status icon component uses event store
          tableId="workloads_pods"
          isConfigurable
          searchFilters={[
            pod => pod.status?.podIP,
          ]}
          renderHeaderTitle="Pods"
          renderTableHeader={[]}
          renderTableContents={() => []}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const Pods = withInjectables<Dependencies>(NonInjectedPods, {
  getProps: (di, props) => ({
    ...props,
    eventStore: di.inject(eventStoreInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});
