/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { InstallChartTabStore } from "./store";
import createDockTabStoreInjectable from "../dock-tab-store/create-dock-tab-store.injectable";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";
import type { HelmReleaseUpdateDetails } from "../../../k8s/helm-releases.api/update.injectable";
import getHelmChartDetailsInjectable from "../../../k8s/helm-charts.api/get-details.injectable";
import getHelmChartValuesInjectable from "../../../k8s/helm-charts.api/get-values.injectable";

const installChartTabStoreInjectable = getInjectable({
  id: "install-chart-tab-store",

  instantiate: (di) => {
    const createDockTabStore = di.inject(createDockTabStoreInjectable);

    return new InstallChartTabStore({
      createStorage: di.inject(createStorageInjectable),
      versionsStore: createDockTabStore<string[]>(),
      detailsStore: createDockTabStore<HelmReleaseUpdateDetails>(),
      getHelmChartDetails: di.inject(getHelmChartDetailsInjectable),
      getHelmChartValues: di.inject(getHelmChartValuesInjectable),
    });
  },
});

export default installChartTabStoreInjectable;
