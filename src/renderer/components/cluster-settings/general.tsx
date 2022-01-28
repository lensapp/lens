/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import type { KubernetesCluster } from "../../../common/catalog-entities";
import getClusterByIdInjectable from "../../../common/cluster-store/get-cluster-by-id.injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import type { EntitySettingViewProps } from "../../../extensions/registries";
import { ClusterIconSetting } from "./components/icon-settings";
import { ClusterKubeconfig } from "./components/kubeconfig";
import { ClusterNameSetting } from "./components/name-setting";

interface Dependencies {
  getClusterById: (id: string) => Cluster | null;
}

const NonInjectedClusterSettingsGeneral = observer(({ getClusterById, entity }: Dependencies & EntitySettingViewProps) => {
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
});

export const ClusterSettingsGeneral = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedClusterSettingsGeneral, {
  getProps: (di, props) => ({
    getClusterById: di.inject(getClusterByIdInjectable),
    ...props,
  }),
});
