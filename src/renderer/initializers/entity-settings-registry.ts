/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { EntitySettingRegistry } from "../../extensions/registries";
import { ClusterSettingsGeneral } from "../components/cluster-settings/general";
import { ClusterSettingsMetrics } from "../components/cluster-settings/metrics";
import { ClusterSettingsNamespaces } from "../components/cluster-settings/namespaces";
import { ClusterSettingsNodeShell } from "../components/cluster-settings/node-shell";
import { ClusterSettingsProxy } from "../components/cluster-settings/proxy";
import { ClusterSettingsTerminal } from "../components/cluster-settings/terminal";

export function initEntitySettingsRegistry() {
  EntitySettingRegistry.getInstance()
    .add([
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        source: "local",
        title: "General",
        group: "Settings",
        components: {
          View: ClusterSettingsGeneral,
        },
      },
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        title: "Proxy",
        group: "Settings",
        components: {
          View: ClusterSettingsProxy,
        },
      },
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        title: "Terminal",
        group: "Settings",
        components: {
          View: ClusterSettingsTerminal,
        },
      },
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        title: "Namespaces",
        group: "Settings",
        components: {
          View: ClusterSettingsNamespaces,
        },
      },
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        title: "Metrics",
        group: "Settings",
        components: {
          View: ClusterSettingsMetrics,
        },
      },
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        title: "Node Shell",
        group: "Settings",
        components: {
          View: ClusterSettingsNodeShell,
        },
      },
    ]);
}
