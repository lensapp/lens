/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { KubernetesCluster } from "../../../common/catalog-entities";
import { ClusterStore } from "../../../common/cluster/store";
import type { EntitySettingViewProps } from "../../../extensions/registries";
import type { CatalogEntity } from "../../api/catalog-entity";
import * as components from "./components";

function getClusterForEntity(entity: CatalogEntity) {
  return ClusterStore.getInstance().getById(entity.getId());
}

export function GeneralSettings({ entity }: EntitySettingViewProps) {
  const cluster = getClusterForEntity(entity);

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <section>
        <div className="flex">
          <div className="flex-grow pr-8">
            <components.ClusterNameSetting cluster={cluster} entity={entity as KubernetesCluster} />
          </div>
          <div>
            <components.ClusterIconSetting cluster={cluster} entity={entity as KubernetesCluster} />
          </div>
        </div>
      </section>
      <section className="small">
        <components.ClusterKubeconfig cluster={cluster} />
      </section>
    </section>
  );
}

export function ProxySettings({ entity }: EntitySettingViewProps) {
  const cluster = getClusterForEntity(entity);

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <components.ClusterProxySetting cluster={cluster} />
    </section>
  );
}

export function TerminalSettings({ entity }: EntitySettingViewProps) {
  const cluster = getClusterForEntity(entity);

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <components.ClusterLocalTerminalSetting cluster={cluster} />
    </section>
  );
}

export function NamespacesSettings({ entity }: EntitySettingViewProps) {
  const cluster = getClusterForEntity(entity);

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <components.ClusterAccessibleNamespaces cluster={cluster} />
    </section>
  );
}

export function MetricsSettings({ entity }: EntitySettingViewProps) {
  const cluster = getClusterForEntity(entity);

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <section>
        <components.ClusterPrometheusSetting cluster={cluster} />
      </section>
      <hr/>
      <section>
        <components.ClusterMetricsSetting cluster={cluster} />
        <components.ShowMetricsSetting cluster={cluster} />
      </section>
    </section>
  );
}

export function NodeShellSettings({ entity }: EntitySettingViewProps) {
  const cluster = getClusterForEntity(entity);

  if(!cluster) {
    return null;
  }

  return (
    <section>
      <components.ClusterNodeShellSetting cluster={cluster} />
    </section>
  );
}
