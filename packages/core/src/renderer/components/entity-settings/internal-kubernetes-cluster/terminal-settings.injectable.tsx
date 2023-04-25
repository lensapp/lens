/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { GetClusterById } from "../../../../features/cluster/storage/common/get-by-id.injectable";
import getClusterByIdInjectable from "../../../../features/cluster/storage/common/get-by-id.injectable";
import { ClusterLocalTerminalSetting } from "../../cluster-settings/local-terminal-settings";
import type { EntitySettingViewProps } from "../extension-registrator.injectable";
import { entitySettingInjectionToken } from "../token";

interface Dependencies {
  getClusterById: GetClusterById;
}

function NonInjectedTerminalKubernetesClusterSettings({ entity, getClusterById }: EntitySettingViewProps & Dependencies) {
  const cluster = getClusterById(entity.getId());

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <ClusterLocalTerminalSetting cluster={cluster} />
    </section>
  );
}

const TerminalKubernetesClusterSettings = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedTerminalKubernetesClusterSettings, {
  getProps: (di, props) => ({
    ...props,
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
});

const terminalKubernetesClusterEntitySettingsInjectable = getInjectable({
  id: "terminal-kubernetes-cluster-entity-settings",
  instantiate: () => ({
    apiVersions: new Set(["entity.k8slens.dev/v1alpha1"]),
    kind: "KubernetesCluster",
    title: "Terminal",
    group: "Settings",
    id: "terminal",
    orderNumber: 20,
    components: {
      View: TerminalKubernetesClusterSettings,
    },
  }),
  injectionToken: entitySettingInjectionToken,
});

export default terminalKubernetesClusterEntitySettingsInjectable;
