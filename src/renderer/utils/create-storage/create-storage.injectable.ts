/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import lensLocalStorageStateInjectable from "./state.injectable";
import createStorageHelperInjectable from "../create-storage-helper.injectable";
import type { StorageLayer } from "../storage-helper";

export type CreateStorage = <T>(key: string, defaultValue: T) => StorageLayer<T>;

const createStorageInjectable = getInjectable({
  id: "create-storage",

  instantiate: (di): CreateStorage => {
    const lensLocalStorageState = di.inject(lensLocalStorageStateInjectable);
    const createStorageHelper = di.inject(createStorageHelperInjectable);

    return <T>(key: string, defaultValue: T) => createStorageHelper<T>(key, {
      defaultValue,
      storage: {
        getItem: (key) => lensLocalStorageState[key] as T,
        setItem: action((key, value) => lensLocalStorageState[key] = value),
        removeItem: action((key) => delete lensLocalStorageState[key]),
      },
    });
  },
});

export default createStorageInjectable;
