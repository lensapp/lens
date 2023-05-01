/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./replication-controller-details.module.scss";
import React from "react";
import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import replicationControllerApiInjectable from "../../../common/k8s-api/endpoints/replication-controller.api.injectable";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";
import type { ShowNotification } from "../notifications";
import { Slider } from "../slider";
import type { ReplicationControllerApi } from "@k8slens/kube-api";
import { ReplicationController } from "@k8slens/kube-object";

interface Dependencies {
  api: ReplicationControllerApi;
  showNotificationError: ShowNotification;
}

@observer
class NonInjectedReplicationControllerDetails extends React.Component<KubeObjectDetailsProps & Dependencies> {
  @observable sliderReplicasValue = (this.props.object as ReplicationController).getDesiredReplicas();
  @observable sliderReplicasDisabled = false;

  constructor(props: KubeObjectDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @action
  async scale(resource: ReplicationController, replicas: number) {
    const { api, showNotificationError } = this.props;

    try {
      await api.scale({
        name: resource.getName(),
        namespace: resource.getNs(),
      }, replicas);
    } catch (error) {
      this.sliderReplicasValue = resource.getDesiredReplicas(); // rollback to last valid value
      showNotificationError(error as Error);
    }
  }

  async onScaleSliderChangeCommitted(resource: ReplicationController, replicas: number) {
    this.sliderReplicasDisabled = true;
    await this.scale(resource, replicas);
    this.sliderReplicasDisabled = false;
  }

  render() {
    const { object: resource } = this.props;

    if (!resource) {
      return null;
    }

    if (!(resource instanceof ReplicationController)) {
      return null;
    }

    return (
      <div className={styles.ReplicationControllerDetails}>
        <DrawerTitle>
          Spec
        </DrawerTitle>
        <DrawerItem name="Replicas">
          <div className={styles.replicas}>
            <div>{resource.getDesiredReplicas()}</div>
            <div>Scale</div>
            <Slider
              min={0}
              max={100}
              valueLabelDisplay="auto"
              disabled={this.sliderReplicasDisabled}
              value={this.sliderReplicasValue}
              onChange={(evt, value) => this.sliderReplicasValue = value}
              onChangeCommitted={(event, value) => void this.onScaleSliderChangeCommitted(resource, value as number)}
            />
          </div>
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

export const ReplicationControllerDetails = withInjectables<Dependencies, KubeObjectDetailsProps>(NonInjectedReplicationControllerDetails, {
  getProps: (di, props) => ({
    ...props,
    api: di.inject(replicationControllerApiInjectable),
    showNotificationError: di.inject(showErrorNotificationInjectable),
  }),
});
