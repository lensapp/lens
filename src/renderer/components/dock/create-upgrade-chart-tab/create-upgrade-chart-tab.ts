/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { DockStore, DockTabCreateSpecific, TabKind } from "../dock-store/dock.store";
import type { UpgradeChartStore } from "../upgrade-chart-store/upgrade-chart.store";

interface Dependencies {
  upgradeChartStore: UpgradeChartStore;
  dockStore: DockStore
}

export const createUpgradeChartTab =
  ({ upgradeChartStore, dockStore }: Dependencies) =>
    (release: HelmRelease, tabParams: DockTabCreateSpecific = {}) => {
      let tab = upgradeChartStore.getTabByRelease(release.getName());

      if (tab) {
        dockStore.open();
        dockStore.selectTab(tab.id);
      }

      if (!tab) {
        tab = dockStore.createTab(
          {
            title: `Helm Upgrade: ${release.getName()}`,
            ...tabParams,
            kind: TabKind.UPGRADE_CHART,
          },
          false,
        );

        upgradeChartStore.setData(tab.id, {
          releaseName: release.getName(),
          releaseNamespace: release.getNs(),
        });
      }

      return tab;
    };
