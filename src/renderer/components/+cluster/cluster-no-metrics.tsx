/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-no-metrics.module.scss";

import React from "react";
import { Icon } from "../icon";
import { cssNames } from "../../utils";
import { broadcastMessage } from "../../../common/ipc";
import { IpcRendererNavigationEvents } from "../../navigation/events";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";

export interface ClusterNoMetricsProps {
  className: string;
}

export function ClusterNoMetrics({ className }: ClusterNoMetricsProps) {
  function getClusterId() {
    return catalogEntityRegistry.activeEntity;
  }

  function openSettingsPage() {
    broadcastMessage(IpcRendererNavigationEvents.NAVIGATE_IN_APP, `/entity/${getClusterId()?.getId()}/settings`);
  }

  return (
    <div className={cssNames(styles.ClusterNoMetrics, className)}>
      <Icon material="info"/>
      <p>Metrics are not available due to missing or invalid Prometheus configuration.</p>
      <p><span className={styles.link} onClick={openSettingsPage}>Open cluster settings</span></p>
    </div>
  );
}
