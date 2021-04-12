import { LensRendererExtension, Store, Interface, Component } from "@k8slens/extensions";
import { MetricsFeature } from "./src/metrics-feature";

export default class ClusterMetricsFeatureExtension extends LensRendererExtension {
  onActivate() {
    Store.catalogCategories
      .getForGroupKind<Store.KubernetesClusterCategory>("entity.k8slens.dev", "KubernetesCluster")
      ?.on("contextMenuOpen", this.clusterContextMenuOpen.bind(this));
  }

  async clusterContextMenuOpen(cluster: Store.KubernetesCluster, ctx: Interface.CatalogEntityContextMenuContext) {
    if (!cluster.status.active) {
      return;
    }

    const metricsFeature = new MetricsFeature();

    await metricsFeature.updateStatus(cluster);

    if (metricsFeature.status.installed) {
      ctx.menuItems.push({
        icon: "ToggleOff",
        title: "Uninstall Lens Metrics stack",
        onClick: async () => {
          await metricsFeature.uninstall(cluster);

          Component.Notifications.info(`Lens Metrics has been removed from ${cluster.metadata.name}`, { timeout: 10_000 });
        }
      });

      if (metricsFeature.status.canUpgrade) {
        ctx.menuItems.push({
          icon: "Refresh",
          title: "Upgrade Lens Metrics stack",
          onClick: async () => {
            metricsFeature.upgrade(cluster);
          }
        });
      }
    } else {
      ctx.menuItems.push({
        icon: "ToggleOn",
        title: "Install Lens Metrics stack",
        onClick: async () => {
          metricsFeature.install(cluster);

          Component.Notifications.info(`Lens Metrics is now installed to ${cluster.metadata.name}`, { timeout: 10_000 });
        }
      });
    }
  }
}
