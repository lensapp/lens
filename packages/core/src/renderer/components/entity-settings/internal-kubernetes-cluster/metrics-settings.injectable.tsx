/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { GetClusterById } from "../../../../features/cluster/storage/common/get-by-id.injectable";
import getClusterByIdInjectable from "../../../../features/cluster/storage/common/get-by-id.injectable";
import { ClusterMetricsSetting } from "../../cluster-settings/metrics-setting";
import { ClusterPrometheusSetting } from "../../cluster-settings/prometheus-setting";
import { ShowMetricsSetting } from "../../cluster-settings/show-metrics";
import type { EntitySettingViewProps } from "../extension-registrator.injectable";
import { entitySettingInjectionToken } from "../token";

interface Dependencies {
  getClusterById: GetClusterById;
}

function NonInjectedMetricsKubernetesClusterSettings({ entity, getClusterById }: EntitySettingViewProps & Dependencies) {
  const cluster = getClusterById(entity.getId());

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <section>
        <ClusterPrometheusSetting cluster={cluster} />
      </section>
      <hr/>
      <section>
        <ClusterMetricsSetting cluster={cluster} />
        <ShowMetricsSetting cluster={cluster} />
      </section>
    </section>
  );
}

const MetricsKubernetesClusterSettings = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedMetricsKubernetesClusterSettings, {
  getProps: (di, props) => ({
    ...props,
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
});

const metricsKubernetesClusterEntitySettingsInjectable = getInjectable({
  id: "metrics-kubernetes-cluster-entity-settings",
  instantiate: () => ({
    apiVersions: new Set(["entity.k8slens.dev/v1alpha1"]),
    kind: "KubernetesCluster",
    title: "Metrics",
    group: "Settings",
    id: "metrics",
    orderNumber: 40,
    components: {
      View: MetricsKubernetesClusterSettings,
    },
  }),
  injectionToken: entitySettingInjectionToken,
});

export default metricsKubernetesClusterEntitySettingsInjectable;
