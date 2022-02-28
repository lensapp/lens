/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import installChartTabStoreInjectable from "./store.injectable";
import type { HelmChart } from "../../../../common/k8s-api/endpoints/helm-charts.api";
import {
  DockTab,
  DockTabCreate,
  DockTabCreateSpecific,
  TabKind,
} from "../dock/store";
import type { InstallChartTabStore } from "./store";
import createDockTabInjectable from "../dock/create-dock-tab.injectable";

interface Dependencies {
  createDockTab: (rawTab: DockTabCreate, addNumber: boolean) => DockTab;
  installChartStore: InstallChartTabStore;
}

const createInstallChartTab = ({ createDockTab, installChartStore }: Dependencies) => (chart: HelmChart, tabParams: DockTabCreateSpecific = {}) => {
  const { name, repo, version } = chart;

  const tab = createDockTab(
    {
      title: `Helm Install: ${repo}/${name}`,
      ...tabParams,
      kind: TabKind.INSTALL_CHART,
    },
    false,
  );

  installChartStore.setData(tab.id, {
    name,
    repo,
    version,
    namespace: "default",
    releaseName: "",
    description: "",
  });

  return tab;
};

const createInstallChartTabInjectable = getInjectable({
  id: "create-install-chart-tab",

  instantiate: (di) => createInstallChartTab({
    installChartStore: di.inject(installChartTabStoreInjectable),
    createDockTab: di.inject(createDockTabInjectable),
  }),
});

export default createInstallChartTabInjectable;
