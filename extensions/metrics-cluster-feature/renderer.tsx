/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { LensRendererExtension, Interface, Component, Catalog} from "@k8slens/extensions";
import { MetricsFeature } from "./src/metrics-feature";

export default class ClusterMetricsFeatureExtension extends LensRendererExtension {
  onActivate() {
    const category = Catalog.catalogCategories.getForGroupKind<Catalog.KubernetesClusterCategory>("entity.k8slens.dev", "KubernetesCluster");

    if (!category) {
      return;
    }

    category.on("contextMenuOpen", this.clusterContextMenuOpen.bind(this));
  }

  async clusterContextMenuOpen(cluster: Catalog.KubernetesCluster, ctx: Interface.CatalogEntityContextMenuContext) {
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
