import React from "react";

import { Cluster } from "../../../main/cluster";
import { ClusterMetricsSetting } from "./components/cluster-metrics-setting";
import { ClusterPrometheusSetting } from "./components/cluster-prometheus-setting";
import { HiddenMetrics } from "./components/hidden-metrics";

interface Props {
  cluster: Cluster;
}

export function Metrics({ cluster }: Props) {
  return (
    <section id="metrics" title="Metrics">
      <section>
        <h1>Metrics</h1>
      </section>
      <ClusterPrometheusSetting cluster={cluster} />

      <section id="hide-metrics">
        <h2>Hide Metrics</h2>
        <ClusterMetricsSetting cluster={cluster}/>
        <HiddenMetrics cluster={cluster}/>
      </section>
    </section>
  );
}
