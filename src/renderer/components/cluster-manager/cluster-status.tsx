/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-status.module.scss";

import { observable } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { clusterActivateHandler } from "../../../common/cluster-ipc";
import { ipcRendererOn, requestMain } from "../../../common/ipc";
import type { Cluster } from "../../../common/cluster/cluster";
import { cssNames, IClassName } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";
import { Spinner } from "../spinner";
import { navigate } from "../../navigation";
import { entitySettingsURL } from "../../../common/routes";
import type { KubeAuthUpdate } from "../../../common/cluster-types";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { CatalogEntity } from "../../../common/catalog";
import getEntityByIdInjectable from "../../catalog/get-entity-by-id.injectable";

export interface ClusterStatusProps {
  className?: IClassName;
  cluster: Cluster;
}

interface Dependencies {
  getEntityById: (id: string) => CatalogEntity;
}

const NonInjectedClusterStatus = observer(({ getEntityById, cluster, className }: Dependencies & ClusterStatusProps) => {
  const [authOutput] = useState(observable.array<KubeAuthUpdate>());
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => (
    ipcRendererOn(`cluster:${cluster.id}:connection-update`, (evt, res: KubeAuthUpdate) => {
      authOutput.push(res);
    })
  ), []);

  const entity = getEntityById(cluster.id);
  const hasErrors = authOutput.some(({ isError }) => isError);

  const reconnect = async () => {
    authOutput.clear();
    setIsReconnecting(true);

    try {
      await requestMain(clusterActivateHandler, cluster.id, true);
    } catch (error) {
      authOutput.push({
        message: error.toString(),
        isError: true,
      });
    } finally {
      setIsReconnecting(false);
    }
  };

  const manageProxySettings = () => {
    navigate(entitySettingsURL({
      params: {
        entityId: cluster.id,
      },
      fragment: "proxy",
    }));
  };

  const renderAuthenticationOutput = () => (
    <pre>
      {authOutput.map(({ message, isError }, index) => (
        <p key={index} className={cssNames({ error: isError })}>
          {message.trim()}
        </p>
      ))}
    </pre>
  );

  const renderStatusIcon = () => {
    if (hasErrors) {
      return <Icon material="cloud_off" className={styles.icon} />;
    }

    return (
      <>
        <Spinner singleColor={false} className={styles.spinner} />
        <pre className="kube-auth-out">
          <p>{isReconnecting ? "Reconnecting" : "Connecting"}&hellip;</p>
        </pre>
      </>
    );
  };

  const renderReconnectionHelp = () => (
    <>
      <Button
        primary
        label="Reconnect"
        className="box center"
        onClick={reconnect}
        waiting={isReconnecting}
      />
      <a
        className="box center interactive"
        onClick={manageProxySettings}
      >
          Manage Proxy Settings
      </a>
    </>
  );

  return (
    <div className={cssNames(styles.status, "flex column box center align-center justify-center", className)}>
      <div className="flex items-center column gaps">
        <h2>{entity?.getName() ?? cluster.name}</h2>
        {renderStatusIcon()}
        {renderAuthenticationOutput()}
        {(!hasErrors || isReconnecting) && renderReconnectionHelp()}
      </div>
    </div>
  );
});

export const ClusterStatus = withInjectables<Dependencies, ClusterStatusProps>(NonInjectedClusterStatus, {
  getProps: (di, props) => ({
    getEntityById: di.inject(getEntityByIdInjectable),
    ...props,
  }),
});
