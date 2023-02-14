/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./replicationcontroller-details.module.scss";
import React from "react";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { ReplicationControllerStore } from "./replicationcontroller-store";
import replicationControllerStoreInjectable from "./replicationcontroller-store.injectable";
import type { ReplicationController } from "../../../common/k8s-api/endpoints";

export interface ReplicationControllerDetailsProps extends KubeObjectDetailsProps<ReplicationController> {
}

interface Dependencies {
  store: ReplicationControllerStore;
}

@observer
class NonInjectedReplicationControllerDetails extends React.Component<ReplicationControllerDetailsProps & Dependencies> {
  render() {
    const { object: resource } = this.props;

    return (
      <div className={styles.ReplicationControllerDetails}>
        <DrawerTitle>
          Spec
        </DrawerTitle>
        <DrawerItem name="Desired Replicas">
          {resource.getDesiredReplicas()}
        </DrawerItem>
        <DrawerItem name="Selectors" labelsOnly>
          {
            resource.getSelectorLabels().map(label => (<Badge key={label} label={label} />))
          }
        </DrawerItem>

        <DrawerTitle>
          Status
        </DrawerTitle>
        <DrawerItem name="Replicas">
          {resource.getReplicas()}
        </DrawerItem>
        <DrawerItem name="Available Replicas">
          {resource.getAvailableReplicas()}
        </DrawerItem>
        <DrawerItem name="Labeled Replicas">
          {resource.getLabeledReplicas()}
        </DrawerItem>
        <DrawerItem name="Controller Generation">
          {resource.getGeneration()}
        </DrawerItem>
        <DrawerItem name="Minimum Pod Readiness">
          {`${resource.getMinReadySeconds()} seconds`}
        </DrawerItem>
      </div>
    );
  }
}

export const ReplicationControllerDetails = withInjectables<Dependencies, ReplicationControllerDetailsProps>(NonInjectedReplicationControllerDetails, {
  getProps: (di, props) => ({
    ...props,
    store: di.inject(replicationControllerStoreInjectable),
  }),
});
