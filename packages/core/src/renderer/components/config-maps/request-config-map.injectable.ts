/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ConfigMapStore } from "./store";
import configMapStoreInjectable from "./store.injectable";

export type RequestConfigMap = ConfigMapStore["load"];

const requestConfigMapInjectable = getInjectable({
  id: "request-config-map",
  instantiate: (di): RequestConfigMap => {
    const configMapStore = di.inject(configMapStoreInjectable);

    return (ref) => configMapStore.load(ref);
  },
});

export default requestConfigMapInjectable;
