/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import getClusterByIdInjectable from "../../../common/cluster-store/get-cluster-by-id.injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import type { EntitySettingViewProps } from "../../../extensions/registries";
import { ClusterMetricsSetting } from "./components/metrics-setting";
import { ClusterPrometheusSetting } from "./components/prometheus-setting";
import { ShowMetricsSetting } from "./components/show-metrics";

interface Dependencies {
  getClusterById: (id: string) => Cluster | null;
}

const NonInjectedClusterSettingsMetrics = observer(({ getClusterById, entity }: Dependencies & EntitySettingViewProps) => {
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
});

export const ClusterSettingsMetrics = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedClusterSettingsMetrics, {
  getProps: (di, props) => ({
    getClusterById: di.inject(getClusterByIdInjectable),
    ...props,
  }),
});
