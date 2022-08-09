/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { UpgradeChartTabStore } from "./store";
import createDockTabStoreInjectable from "../dock-tab-store/create-dock-tab-store.injectable";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";
import requestHelmReleaseConfigurationInjectable from "../../../../common/k8s-api/endpoints/helm-releases.api/get-configuration.injectable";

const upgradeChartTabStoreInjectable = getInjectable({
  id: "upgrade-chart-tab-store",

  instantiate: (di) => {
    const createDockTabStore = di.inject(createDockTabStoreInjectable);

    return new UpgradeChartTabStore({
      createStorage: di.inject(createStorageInjectable),
      valuesStore: createDockTabStore<string>(),
      requestHelmReleaseConfiguration: di.inject(requestHelmReleaseConfigurationInjectable),
    });
  },
});

export default upgradeChartTabStoreInjectable;
