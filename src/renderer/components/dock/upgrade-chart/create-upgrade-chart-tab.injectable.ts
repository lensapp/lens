/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import upgradeChartTabStoreInjectable from "./store.injectable";
import dockStoreInjectable from "../dock/store.injectable";
import type { DockTabCreateSpecific, TabId } from "../dock/store";
import { TabKind } from "../dock/store";
import { runInAction } from "mobx";
import type { HelmRelease } from "../../../k8s/helm-release";

export type CreateUpgradeChartTab = (release: HelmRelease, tabParams?: DockTabCreateSpecific) => TabId;

const createUpgradeChartTabInjectable = getInjectable({
  id: "create-upgrade-chart-tab",

  instantiate: (di): CreateUpgradeChartTab => {
    const dockStore = di.inject(dockStoreInjectable);
    const upgradeChartStore = di.inject(upgradeChartTabStoreInjectable);

    return (release, tabParams = {}) => {
      const tabId = upgradeChartStore.getTabIdByRelease(release.getName());

      if (tabId) {
        dockStore.open();
        dockStore.selectTab(tabId);

        return tabId;
      }

      return runInAction(() => {
        const tab = dockStore.createTab(
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

        return tab.id;
      });
    };
  },
});

export default createUpgradeChartTabInjectable;
