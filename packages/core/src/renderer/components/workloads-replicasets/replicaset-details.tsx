/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./replicaset-details.scss";
import React from "react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { PodDetailsStatuses } from "../workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../workloads-pods/pod-details-affinities";
import { disposeOnUnmount, observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ReplicaSet } from "@k8slens/kube-object";
import { PodDetailsList } from "../workloads-pods/pod-details-list";
import type { Logger } from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { PodStore } from "../workloads-pods/store";
import podStoreInjectable from "../workloads-pods/store.injectable";
import type { ReplicaSetStore } from "./store";
import replicaSetStoreInjectable from "./store.injectable";
import loggerInjectable from "../../../common/logger.injectable";

export interface ReplicaSetDetailsProps extends KubeObjectDetailsProps<ReplicaSet> {
}

interface Dependencies {
  subscribeStores: SubscribeStores;
  podStore: PodStore;
  replicaSetStore: ReplicaSetStore;
  logger: Logger;
}

@observer
class NonInjectedReplicaSetDetails extends React.Component<ReplicaSetDetailsProps & Dependencies> {
  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.podStore,
      ]),
    ]);
  }
  render() {
    const { object: replicaSet, replicaSetStore, logger } = this.props;

    if (!replicaSet) {
      return null;
    }

    if (!(replicaSet instanceof ReplicaSet)) {
      logger.error("[ReplicaSetDetails]: passed object that is not an instanceof ReplicaSet", replicaSet);

      return null;
    }

    const { availableReplicas, replicas } = replicaSet.status ?? {};
    const selectors = replicaSet.getSelectors();
    const nodeSelector = replicaSet.getNodeSelectors();
    const images = replicaSet.getImages();
    const childPods = replicaSetStore.getChildPods(replicaSet);

    return (
      <div className="ReplicaSetDetails">
        {selectors.length > 0 && (
          <DrawerItem name="Selector" labelsOnly>
            {
              selectors.map(label => <Badge key={label} label={label}/>)
            }
          </DrawerItem>
        )}
        {nodeSelector.length > 0 && (
          <DrawerItem name="Node Selector" labelsOnly>
            {
              nodeSelector.map(label => <Badge key={label} label={label}/>)
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
        <DrawerItem name="Replicas">
          {`${availableReplicas || 0} current / ${replicas || 0} desired`}
        </DrawerItem>
        <PodDetailsTolerations workload={replicaSet}/>
        <PodDetailsAffinities workload={replicaSet}/>
        <DrawerItem name="Pod Status" className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <PodDetailsList pods={childPods} owner={replicaSet}/>
      </div>
    );
  }
}

export const ReplicaSetDetails = withInjectables<Dependencies, ReplicaSetDetailsProps>(NonInjectedReplicaSetDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    podStore: di.inject(podStoreInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    logger: di.inject(loggerInjectable),
  }),
});
