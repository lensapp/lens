import React from "react";
import { LensRendererExtension, Catalog } from "@k8slens/extensions";
import { MetricsSettings } from "./src/metrics-settings";

export default class ClusterMetricsFeatureExtension extends LensRendererExtension {
  entitySettings = [
    {
      apiVersions: ["entity.k8slens.dev/v1alpha1"],
      kind: "KubernetesCluster",
      title: "Lens Metrics",
      priority: 5,
      components: {
        View: (props: {entity: Catalog.KubernetesCluster}) => { // eslint-disable-line
          const cluster = props.entity; // eslint-disable-line

          return (
            <section>
              <section>
                <MetricsSettings cluster={cluster} />
              </section>
            </section>
          );
        }
      }
    }
  ];
}
