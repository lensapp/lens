/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-no-metrics.module.scss";

import React from "react";
import { cssNames } from "@k8slens/utilities";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Icon } from "./icon";
import { navigateToPreferencesOfMetricsInjectionToken } from "../injection-tokens";

export interface ClusterNoMetricsProps {
  className: string;
}

interface Dependencies {
  navigateToPreferencesOfMetrics: () => void;
}

export function NonInjectedClusterNoMetrics({ className, navigateToPreferencesOfMetrics }: Dependencies & ClusterNoMetricsProps) {
  return (
    <div className={cssNames(styles.ClusterNoMetrics, className)} data-testid="no-metrics-message">
      <Icon material="info"/>
      <p>Metrics are not available due to missing or invalid Prometheus configuration.</p>
      <p><span className={styles.link} onClick={navigateToPreferencesOfMetrics}>Open cluster settings</span></p>
    </div>
  );
}

export const ClusterNoMetrics = withInjectables<Dependencies, ClusterNoMetricsProps>(
  NonInjectedClusterNoMetrics,

  {
    getProps: (di, props) => ({
      navigateToPreferencesOfMetrics: di.inject(navigateToPreferencesOfMetricsInjectionToken),
      ...props,
    }),
  },
);
