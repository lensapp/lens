/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./replicationcontroller-details.module.scss";
import React from "react";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { ReplicationControllerStore } from "./replicationctrl-store";
import replicationControllerStoreInjectable from "./replicationctrl-store.injectable";
import type { ReplicationController } from "../../../common/k8s-api/endpoints";

export interface ReplicationControllerDetailsProps extends KubeObjectDetailsProps<ReplicationController> {
}

interface Dependencies {
  store: ReplicationControllerStore;
}

@observer
class NonInjectedReplicationControllerDetails extends React.Component<ReplicationControllerDetailsProps & Dependencies> {
  render() {
    const { object: ctrl, store } = this.props;

    return (
      <div className={styles.ReplicationControllerDetails}>
        <DrawerItem name="Some info" labelsOnly>
          <p>Controller: {ctrl.getName()}</p>
          <p>Items in store: <Badge label={store.items.length} /></p>
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
