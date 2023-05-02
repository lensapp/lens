/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import type { StorageHelperDependencies, StorageHelperOptions } from "./storage-helper";
import { StorageHelper } from "./storage-helper";

export type CreateStorageHelper = <T>(key: string, options: StorageHelperOptions<T>) => StorageHelper<T>;

const createStorageHelperInjectable = getInjectable({
  id: "create-storage-helper",
  instantiate: (di): CreateStorageHelper => {
    const deps: StorageHelperDependencies = {
      logger: di.inject(loggerInjectionToken),
    };

    return (key, options) => new StorageHelper(deps, key, options);
  },
});

export default createStorageHelperInjectable;
