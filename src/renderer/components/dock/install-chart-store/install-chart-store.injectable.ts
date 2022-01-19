/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { InstallChartStore } from "./install-chart.store";
import dockStoreInjectable from "../dock-store/dock-store.injectable";
import createDockTabStoreInjectable from "../dock-tab-store/create-dock-tab-store.injectable";
import type { IReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

const installChartStoreInjectable = getInjectable({
  instantiate: (di) => {
    const createDockTabStore = di.inject(createDockTabStoreInjectable);

    return new InstallChartStore({
      dockStore: di.inject(dockStoreInjectable),
      createStorage: di.inject(createStorageInjectable),
      versionsStore: createDockTabStore<string[]>(),
      detailsStore: createDockTabStore<IReleaseUpdateDetails>(),
    });
  },
  lifecycle: lifecycleEnum.singleton,
});

export default installChartStoreInjectable;
