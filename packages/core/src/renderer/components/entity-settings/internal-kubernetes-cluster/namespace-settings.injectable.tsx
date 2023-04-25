/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { GetClusterById } from "../../../../features/cluster/storage/common/get-by-id.injectable";
import getClusterByIdInjectable from "../../../../features/cluster/storage/common/get-by-id.injectable";
import { ClusterAccessibleNamespaces } from "../../cluster-settings/accessible-namespaces";
import type { EntitySettingViewProps } from "../extension-registrator.injectable";
import { entitySettingInjectionToken } from "../token";

interface Dependencies {
  getClusterById: GetClusterById;
}

function NonInjectedNamespaceKubernetesClusterSettings({ entity, getClusterById }: EntitySettingViewProps & Dependencies) {
  const cluster = getClusterById(entity.getId());

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <ClusterAccessibleNamespaces cluster={cluster} />
    </section>
  );
}

const NamespaceKubernetesClusterSettings = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedNamespaceKubernetesClusterSettings, {
  getProps: (di, props) => ({
    ...props,
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
});

const namespaceKubernetesClusterEntitySettingsInjectable = getInjectable({
  id: "namespace-kubernetes-cluster-entity-settings",
  instantiate: () => ({
    apiVersions: new Set(["entity.k8slens.dev/v1alpha1"]),
    kind: "KubernetesCluster",
    title: "Namespace",
    group: "Settings",
    id: "namespace",
    orderNumber: 30,
    components: {
      View: NamespaceKubernetesClusterSettings,
    },
  }),
  injectionToken: entitySettingInjectionToken,
});

export default namespaceKubernetesClusterEntitySettingsInjectable;
