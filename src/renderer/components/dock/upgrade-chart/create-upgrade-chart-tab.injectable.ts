/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import upgradeChartTabStoreInjectable from "./store.injectable";
import dockStoreInjectable from "../dock/store.injectable";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import type { DockStore, DockTabCreateSpecific, TabId } from "../dock/store";
import { TabKind } from "../dock/store";
import type { UpgradeChartTabStore } from "./store";
import { runInAction } from "mobx";
import getRandomUpgradeChartTabIdInjectable from "./get-random-upgrade-chart-tab-id.injectable";

interface Dependencies {
  upgradeChartStore: UpgradeChartTabStore;
  dockStore: DockStore;
  getRandomId: () => string;
}

const createUpgradeChartTab = ({ upgradeChartStore, dockStore, getRandomId }: Dependencies) => (release: HelmRelease, tabParams: DockTabCreateSpecific = {}): TabId => {
  const tabId = upgradeChartStore.getTabIdByRelease(release.getName());

  if (tabId) {
    dockStore.open();
    dockStore.selectTab(tabId);

    return tabId;
  }

  return runInAction(() => {
    const tab = dockStore.createTab(
      {
        id: getRandomId(),
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

const createUpgradeChartTabInjectable = getInjectable({
  id: "create-upgrade-chart-tab",

  instantiate: (di) => createUpgradeChartTab({
    upgradeChartStore: di.inject(upgradeChartTabStoreInjectable),
    dockStore: di.inject(dockStoreInjectable),
    getRandomId: di.inject(getRandomUpgradeChartTabIdInjectable),
  }),
});

export default createUpgradeChartTabInjectable;
