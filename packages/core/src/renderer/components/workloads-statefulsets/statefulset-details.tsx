/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./statefulset-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import { PodDetailsStatuses } from "../workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../workloads-pods/pod-details-affinities";
import type { StatefulSetStore } from "./store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { StatefulSet } from "@k8slens/kube-object";
import { PodDetailsList } from "../workloads-pods/pod-details-list";
import type { Logger } from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { PodStore } from "../workloads-pods/store";
import podStoreInjectable from "../workloads-pods/store.injectable";
import statefulSetStoreInjectable from "./store.injectable";
import loggerInjectable from "../../../common/logger.injectable";

export interface StatefulSetDetailsProps extends KubeObjectDetailsProps<StatefulSet> {
}

interface Dependencies {
  subscribeStores: SubscribeStores;
  podStore: PodStore;
  statefulSetStore: StatefulSetStore;
  logger: Logger;
}

@observer
class NonInjectedStatefulSetDetails extends React.Component<StatefulSetDetailsProps & Dependencies> {
  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.podStore,
      ]),
    ]);
  }

  render() {
    const { object: statefulSet, statefulSetStore, logger } = this.props;

    if (!statefulSet) {
      return null;
    }

    if (!(statefulSet instanceof StatefulSet)) {
      logger.error("[StatefulSetDetails]: passed object that is not an instanceof StatefulSet", statefulSet);

      return null;
    }

    const images = statefulSet.getImages();
    const selectors = statefulSet.getSelectors();
    const nodeSelector = statefulSet.getNodeSelectors();
    const childPods = statefulSetStore.getChildPods(statefulSet);

    return (
      <div className="StatefulSetDetails">
        {selectors.length && (
          <DrawerItem name="Selector" labelsOnly>
            {
              selectors.map(label => <Badge key={label} label={label}/>)
            }
          </DrawerItem>
        )}
        {nodeSelector.length > 0 && (
          <DrawerItem name="Node Selector" labelsOnly>
            {
              nodeSelector.map(label => (
                <Badge key={label} label={label}/>
              ))
            }
          </DrawerItem>
        )}
        {images.length > 0 && (
          <DrawerItem name="Images">
            {
              images.map(image => <p key={image}>{image}</p>)
            }
          </DrawerItem>
        )}
        <PodDetailsTolerations workload={statefulSet}/>
        <PodDetailsAffinities workload={statefulSet}/>
        <DrawerItem name="Pod Status" className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <PodDetailsList pods={childPods} owner={statefulSet}/>
      </div>
    );
  }
}

export const StatefulSetDetails = withInjectables<Dependencies, StatefulSetDetailsProps>(NonInjectedStatefulSetDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    podStore: di.inject(podStoreInjectable),
    statefulSetStore: di.inject(statefulSetStoreInjectable),
    logger: di.inject(loggerInjectable),
  }),
});

