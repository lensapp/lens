import { LensRendererExtension, Store, Interface, Component } from "@k8slens/extensions";
import { MetricsFeature } from "./src/metrics-feature";

export default class ClusterMetricsFeatureExtension extends LensRendererExtension {
  onActivate() {
    const category = Store.catalogCategories.getForGroupKind<Store.KubernetesClusterCategory>("entity.k8slens.dev", "KubernetesCluster");

    if (!category) {
      return;
    }

    category.on("contextMenuOpen", this.clusterContextMenuOpen.bind(this));
  }

  async clusterContextMenuOpen(cluster: Store.KubernetesCluster, ctx: Interface.CatalogEntityContextMenuContext) {
    if (!cluster.status.active) {
      return;
    }

    const metricsFeature = new MetricsFeature();

    await metricsFeature.updateStatus(cluster);

    if (metricsFeature.status.installed) {
      if (metricsFeature.status.canUpgrade) {
        ctx.menuItems.unshift({
          icon: "refresh",
          title: "Upgrade Lens Metrics stack",
          onClick: async () => {
            metricsFeature.upgrade(cluster);
          }
        });
      }
      ctx.menuItems.unshift({
        icon: "toggle_off",
        title: "Uninstall Lens Metrics stack",
        onClick: async () => {
          await metricsFeature.uninstall(cluster);

          Component.Notifications.info(`Lens Metrics has been removed from ${cluster.metadata.name}`, { timeout: 10_000 });
        }
      });
    } else {
      ctx.menuItems.unshift({
        icon: "toggle_on",
        title: "Install Lens Metrics stack",
        onClick: async () => {
          metricsFeature.install(cluster);

          Component.Notifications.info(`Lens Metrics is now installed to ${cluster.metadata.name}`, { timeout: 10_000 });
        }
      });
    }
  }
}
