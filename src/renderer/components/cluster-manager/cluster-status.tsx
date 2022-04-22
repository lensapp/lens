/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-status.module.scss";

import { computed, observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { ipcRendererOn } from "../../../common/ipc";
import type { Cluster } from "../../../common/cluster/cluster";
import type { IClassName } from "../../utils";
import { cssNames } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";
import { Spinner } from "../spinner";
import type { KubeAuthUpdate } from "../../../common/cluster-types";
import type { CatalogEntityRegistry } from "../../api/catalog/entity/registry";
import { requestClusterActivation } from "../../ipc";
import type { NavigateToEntitySettings } from "../../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import navigateToEntitySettingsInjectable from "../../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";

export interface ClusterStatusProps {
  className?: IClassName;
  cluster: Cluster;
}

interface Dependencies {
  navigateToEntitySettings: NavigateToEntitySettings;
  entityRegistry: CatalogEntityRegistry;
}

@observer
class NonInjectedClusterStatus extends React.Component<ClusterStatusProps & Dependencies> {
  @observable authOutput: KubeAuthUpdate[] = [];
  @observable isReconnecting = false;

  constructor(props: ClusterStatusProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get cluster(): Cluster {
    return this.props.cluster;
  }

  @computed get entity() {
    return this.props.entityRegistry.getById(this.cluster.id);
  }

  @computed get hasErrors(): boolean {
    return this.authOutput.some(({ isError }) => isError);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      ipcRendererOn(`cluster:${this.cluster.id}:connection-update`, (evt, res: KubeAuthUpdate) => {
        this.authOutput.push(res);
      }),
    ]);
  }

  componentDidUpdate(prevProps: Readonly<ClusterStatusProps>): void {
    if (prevProps.cluster.id !== this.props.cluster.id) {
      this.isReconnecting = false;
      this.authOutput = [];
    }
  }

  reconnect = async () => {
    this.authOutput = [];
    this.isReconnecting = true;

    try {
      await requestClusterActivation(this.cluster.id, true);
    } catch (error) {
      this.authOutput.push({
        message: String(error),
        isError: true,
      });
    } finally {
      this.isReconnecting = false;
    }
  };

  manageProxySettings = () => {
    this.props.navigateToEntitySettings(this.cluster.id, "proxy");
  };

  renderAuthenticationOutput() {
    return (
      <pre>
        {
          this.authOutput.map(({ message, isError }, index) => (
            <p key={index} className={cssNames({ error: isError })}>
              {message.trim()}
            </p>
          ))
        }
      </pre>
    );
  }

  renderStatusIcon() {
    if (this.hasErrors) {
      return <Icon material="cloud_off" className={styles.icon} />;
    }

    return (
      <>
        <Spinner singleColor={false} className={styles.spinner} />
        <pre className="kube-auth-out">
          <p>
            {this.isReconnecting ? "Reconnecting" : "Connecting"}
            &hellip;
          </p>
        </pre>
      </>
    );
  }

  renderReconnectionHelp() {
    if (this.hasErrors && !this.isReconnecting) {
      return (
        <>
          <Button
            primary
            label="Reconnect"
            className="box center"
            onClick={this.reconnect}
            waiting={this.isReconnecting}
          />
          <a
            className="box center interactive"
            onClick={this.manageProxySettings}
          >
            Manage Proxy Settings
          </a>
        </>
      );
    }

    return undefined;
  }

  render() {
    return (
      <div className={cssNames(styles.status, "flex column box center align-center justify-center", this.props.className)}>
        <div className="flex items-center column gaps">
          <h2>{this.entity?.getName() ?? this.cluster.name}</h2>
          {this.renderStatusIcon()}
          {this.renderAuthenticationOutput()}
          {this.renderReconnectionHelp()}
        </div>
      </div>
    );
  }
}

export const ClusterStatus = withInjectables<Dependencies, ClusterStatusProps>(NonInjectedClusterStatus, {
  getProps: (di, props) => ({
    ...props,
    navigateToEntitySettings: di.inject(navigateToEntitySettingsInjectable),
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
  }),
});
