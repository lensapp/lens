import { Registry, LensRendererExtension } from "@k8slens/extensions"
import { MetricsFeature } from "./src/metrics-feature"

export default class ClusterMetricsFeatureExtension extends LensRendererExtension {
  registerClusterFeatures(registry: Registry.ClusterFeatureRegistry) {
    this.disposers.push(
      registry.add({
        title: "Metrics Stack",
        description: "Enable timeseries data visualization (Prometheus stack) for your cluster.",
        feature: new MetricsFeature()
      })
    )
  }
}
