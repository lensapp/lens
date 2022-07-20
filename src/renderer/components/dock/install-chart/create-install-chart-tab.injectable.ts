/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import installChartTabStoreInjectable from "./store.injectable";
import type { HelmChart } from "../../../../common/k8s-api/endpoints/helm-charts.api";
import type { DockTab, DockTabCreateSpecific } from "../dock/store";
import { TabKind } from "../dock/store";
import createDockTabInjectable from "../dock/create-dock-tab.injectable";
import getRandomInstallChartTabIdInjectable from "./get-random-install-chart-tab-id.injectable";

export type CreateInstallChartTab = (chart: HelmChart, tabParams?: DockTabCreateSpecific) => DockTab;

const createInstallChartTabInjectable = getInjectable({
  id: "create-install-chart-tab",

  instantiate: (di) => {
    const installChartStore = di.inject(installChartTabStoreInjectable);
    const createDockTab = di.inject(createDockTabInjectable);
    const getRandomId = di.inject(getRandomInstallChartTabIdInjectable);

    return (chart: HelmChart, tabParams: DockTabCreateSpecific = {}) => {
      const { name, repo, version } = chart;

      const tab = createDockTab(
        {
          id: getRandomId(),
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
  },
});

export default createInstallChartTabInjectable;
