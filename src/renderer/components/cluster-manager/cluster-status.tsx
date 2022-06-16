/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-status.module.scss";

import { runInAction } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { Cluster } from "../../../common/cluster/cluster";
import type { IClassName } from "../../utils";
import { cssNames } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";
import { Spinner } from "../spinner";
import type { CatalogEntityRegistry } from "../../api/catalog/entity/registry";
import type { NavigateToEntitySettings } from "../../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import navigateToEntitySettingsInjectable from "../../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import type { ClusterConnectionStatus } from "./cluster-status.state.injectable";
import clusterConnectionStatusStateInjectable from "./cluster-status.state.injectable";
import type { RequestClusterActivation } from "../../cluster/request-activation.injectable";
import requestClusterActivationInjectable from "../../cluster/request-activation.injectable";

export interface ClusterStatusProps {
  className?: IClassName;
  cluster: Cluster;
}

interface Dependencies {
  navigateToEntitySettings: NavigateToEntitySettings;
  entityRegistry: CatalogEntityRegistry;
  state: ClusterConnectionStatus;
  requestClusterActivation: RequestClusterActivation;
}

const NonInjectedClusterStatus = observer((props: ClusterStatusProps & Dependencies) => {
  const {
    cluster,
    navigateToEntitySettings,
    state,
    className,
    entityRegistry,
    requestClusterActivation,
  } = props;
  const entity = entityRegistry.getById(cluster.id);
  const clusterName = entity?.getName() ?? cluster.name;

  const reconnect = async () => {
    runInAction(() => {
      state.resetAuthOutput();
      state.setAsReconnecting();
    });

    try {
      await requestClusterActivation({
        clusterId: cluster.id,
        force: true,
      });
    } catch (error) {
      state.appendAuthUpdate({
        message: String(error),
        isError: true,
      });
    } finally {
      state.clearReconnectingState();
    }
  };

  const manageProxySettings = () => navigateToEntitySettings(cluster.id, "proxy");

  const renderAuthenticationOutput = () => {
    return (
      <pre>
        {
          state.authOutput
            .get()
            .map(({ message, isError }, index) => (
              <p key={index} className={cssNames({ error: isError })}>
                {message.trim()}
              </p>
            ))
        }
      </pre>
    );
  };

  const renderStatusIcon = () => {
    if (state.hasErrorOutput.get()) {
      return <Icon material="cloud_off" className={styles.icon} />;
    }

    return (
      <>
        <Spinner singleColor={false} className={styles.spinner} />
        <pre className="kube-auth-out">
          <p>
            {state.isReconnecting.get() ? "Reconnecting" : "Connecting"}
            &hellip;
          </p>
        </pre>
      </>
    );
  };

  const renderReconnectionHelp = () => {
    if (state.hasErrorOutput.get() && !state.isReconnecting.get()) {
      return (
        <>
          <Button
            primary
            label="Reconnect"
            className="box center"
            onClick={reconnect}
            waiting={state.isReconnecting.get()}
          />
          <a
            className="box center interactive"
            onClick={manageProxySettings}
          >
            Manage Proxy Settings
          </a>
        </>
      );
    }

    return undefined;
  };

  return (
    <div
      className={cssNames(styles.status, "flex column box center align-center justify-center", className)}
      data-testid="cluster-status"
    >
      <div className="flex items-center column gaps">
        <h2>{clusterName}</h2>
        {renderStatusIcon()}
        {renderAuthenticationOutput()}
        {renderReconnectionHelp()}
      </div>
    </div>
  );
});

export const ClusterStatus = withInjectables<Dependencies, ClusterStatusProps>(NonInjectedClusterStatus, {
  getProps: (di, props) => ({
    ...props,
    navigateToEntitySettings: di.inject(navigateToEntitySettingsInjectable),
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
    state: di.inject(clusterConnectionStatusStateInjectable).forCluster(props.cluster.id),
    requestClusterActivation: di.inject(requestClusterActivationInjectable),
  }),
});
