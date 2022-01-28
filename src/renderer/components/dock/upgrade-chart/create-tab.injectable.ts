/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-release.api";
import { bind } from "../../../utils";
import createDockTabInjectable from "../dock/create-tab.injectable";
import selectDockTabInjectable from "../dock/select-tab.injectable";
import { type DockTabCreateSpecific, TabKind, TabId, DockTabCreate, DockTabData, DockTabCreateOptions } from "../dock/store";
import type { UpgradeChartTabStore } from "./store";
import upgradeChartTabStoreInjectable from "./store.injectable";

interface Dependencies {
  upgradeChartTabStore: UpgradeChartTabStore;
  selectDockTab: (tabId: TabId) => boolean;
  createDockTab: (data: DockTabCreate, opts?: DockTabCreateOptions) => DockTabData;
}

function createUpgradeChartTab({ upgradeChartTabStore, selectDockTab, createDockTab }: Dependencies, release: HelmRelease, tabParams: DockTabCreateSpecific = {}) {
  const tabId = upgradeChartTabStore.getTabIdByRelease(release.getName());

  if (tabId) {
    if (selectDockTab(tabId)) {
      return tabId;
    } else {
      // somehow `upgradeChartTabStore` thinks there is a tab for `object` but it doesn't actually exist
      upgradeChartTabStore.clearData(tabId);
    }
  }

  return runInAction(() => {
    const tab = createDockTab( {
      title: `Helm Upgrade: ${release.getName()}`,
      ...tabParams,
      kind: TabKind.UPGRADE_CHART,
    });

    upgradeChartTabStore.setData(tab.id, {
      releaseName: release.getName(),
      releaseNamespace: release.getNs(),
    });

    return tab.id;
  });
}

const newUpgradeChartTabInjectable = getInjectable({
  instantiate: (di) => bind(createUpgradeChartTab, null, {
    selectDockTab: di.inject(selectDockTabInjectable),
    createDockTab: di.inject(createDockTabInjectable),
    upgradeChartTabStore: di.inject(upgradeChartTabStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default newUpgradeChartTabInjectable;
