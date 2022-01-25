/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import type { TabId } from "../dock/store";
import type { InstallChartTabStore } from "./store";
import installChartTabStoreInjectable from "./store.injectable";

interface Dependencies {
  installChartTabStore: InstallChartTabStore;
}

function clearInstallChartTabData({ installChartTabStore }: Dependencies, tabId: TabId) {
  installChartTabStore.clearData(tabId);
}

const clearInstallChartTabDataInjectable = getInjectable({
  instantiate: (di) => bind(clearInstallChartTabData, null, {
    installChartTabStore: di.inject(installChartTabStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default clearInstallChartTabDataInjectable;
