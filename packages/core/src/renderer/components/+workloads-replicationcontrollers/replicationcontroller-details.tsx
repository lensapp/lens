/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./replicationcontroller-details.module.scss";
import React from "react";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { ReplicationControllerStore } from "./replicationcontroller-store";
import replicationControllerStoreInjectable from "./replicationcontroller-store.injectable";
import type {
  ReplicationController,
  ReplicationControllerApi,
} from "../../../common/k8s-api/endpoints";
import replicationControllerApiInjectable
  from "../../../common/k8s-api/endpoints/replication-controller.api.injectable";
import { Button } from "../button";
import { Input } from "../input";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";
import type { ShowNotification } from "../notifications";
import hideDetailsInjectable from "../kube-detail-params/hide-details.injectable";

export interface ReplicationControllerDetailsProps extends KubeObjectDetailsProps<ReplicationController> {
}

interface Dependencies {
  store: ReplicationControllerStore;
  api: ReplicationControllerApi;
  showNotificationError: ShowNotification;

  hideDetails(): void;
}

@observer
class NonInjectedReplicationControllerDetails<Props extends ReplicationControllerDetailsProps & Dependencies> extends React.Component<Props> {
  @observable showScaleDialog = false;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  inputRef = React.createRef<Input>();

  scale(replicas: number) {
    const { object: resource, api } = this.props;

    return api.scale({
      name: resource.getName(),
      namespace: resource.getNs(),
    }, replicas);
  }

  renderReplicasAndScaleDialog() {
    const { object: resource, showNotificationError, hideDetails } = this.props;

    if (this.showScaleDialog) {
      return (
        <div className={styles.desiredReplicas}>
          <Input
            type="number"
            min={1}
            max={100}
            defaultValue={resource.getDesiredReplicas().toString()}
            ref={this.inputRef}
          />
          <Button
            accent
            label="Cancel"
            onClick={() => this.showScaleDialog = false}
          />
          <Button
            primary
            label="Scale"
            onClick={async () => {
              const inputComponent = this.inputRef.current;
              const newScaleVal = Number(inputComponent?.getValue());

              if (isNaN(newScaleVal)) return;

              try {
                await this.scale(newScaleVal);
                this.showScaleDialog = false;
                hideDetails();
              } catch (err) {
                showNotificationError(String(err));
              }
            }}
          />
        </div>
      );
    }

    return (
      <div className={styles.desiredReplicas}>
        <div>
          {resource.getDesiredReplicas()}
        </div>
        <Button
          primary
          label="Scale"
          onClick={() => {
            this.showScaleDialog = true;
            requestAnimationFrame(() => this.inputRef.current?.focus());
          }}
        />
      </div>
    );
  }

  render() {
    const { object: resource } = this.props;

    return (
      <div className={styles.ReplicationControllerDetails}>
        <DrawerTitle>
          Spec
        </DrawerTitle>
        <DrawerItem name="Desired Replicas">
          {this.renderReplicasAndScaleDialog()}
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
    api: di.inject(replicationControllerApiInjectable),
    showNotificationError: di.inject(showErrorNotificationInjectable),
    hideDetails: di.inject(hideDetailsInjectable),
  }),
});
