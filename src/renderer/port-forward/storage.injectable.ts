/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StorageLayer } from "../utils";
import createStorageInjectable from "../utils/create-storage/create-storage.injectable";
import type { ForwardedPort } from "./port-forward";

let storage: StorageLayer<ForwardedPort[] | undefined>;

const portForwardStorageInjectable = getInjectable({
  setup: async (di) => {
    storage = await di.inject(createStorageInjectable)("port_forwards", undefined);
  },
  instantiate: () => storage,
  lifecycle: lifecycleEnum.singleton,
});

export default portForwardStorageInjectable;
