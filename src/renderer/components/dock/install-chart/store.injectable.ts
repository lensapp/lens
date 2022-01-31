/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { InstallChartTabStore } from "./store";
import createDockTabStoreInjectable from "../dock-tab-store/create-dock-tab-store.injectable";
import type { IReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

const installChartTabStoreInjectable = getInjectable({
  instantiate: (di) => {
    const createDockTabStore = di.inject(createDockTabStoreInjectable);

    return new InstallChartTabStore({
      createStorage: di.inject(createStorageInjectable),
      versionsStore: createDockTabStore<string[]>(),
      detailsStore: createDockTabStore<IReleaseUpdateDetails>(),
    });
  },
  lifecycle: lifecycleEnum.singleton,
});

export default installChartTabStoreInjectable;
