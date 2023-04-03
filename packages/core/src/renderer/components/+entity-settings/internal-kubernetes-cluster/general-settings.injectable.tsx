/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { KubernetesCluster } from "../../../../common/catalog-entities";
import type { GetClusterById } from "../../../../features/cluster/storage/common/get-by-id.injectable";
import getClusterByIdInjectable from "../../../../features/cluster/storage/common/get-by-id.injectable";
import { ClusterIconSetting } from "../../cluster-settings/icon-settings";
import { ClusterKubeconfig } from "../../cluster-settings/kubeconfig";
import { ClusterNameSetting } from "../../cluster-settings/name-setting";
import type { EntitySettingViewProps } from "../extension-registrator.injectable";
import { entitySettingInjectionToken } from "../token";

interface Dependencies {
  getClusterById: GetClusterById;
}

function NonInjectedGeneralKubernetesClusterSettings({ entity, getClusterById }: EntitySettingViewProps & Dependencies) {
  const cluster = getClusterById(entity.getId());

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <section>
        <div className="flex">
          <div className="flex-grow pr-8">
            <ClusterNameSetting cluster={cluster} entity={entity as KubernetesCluster} />
          </div>
          <div>
            <ClusterIconSetting cluster={cluster} entity={entity as KubernetesCluster} />
          </div>
        </div>
      </section>
      <section className="small">
        <ClusterKubeconfig cluster={cluster} />
      </section>
    </section>
  );
}

const GeneralKubernetesClusterSettings = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedGeneralKubernetesClusterSettings, {
  getProps: (di, props) => ({
    ...props,
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
});

const generalKubernetesClusterEntitySettingsInjectable = getInjectable({
  id: "general-kubernetes-cluster-entity-settings",
  instantiate: () => ({
    apiVersions: new Set(["entity.k8slens.dev/v1alpha1"]),
    kind: "KubernetesCluster",
    source: "local",
    title: "General",
    group: "Settings",
    id: "general",
    orderNumber: 0,
    components: {
      View: GeneralKubernetesClusterSettings,
    },
  }),
  injectionToken: entitySettingInjectionToken,
});

export default generalKubernetesClusterEntitySettingsInjectable;
