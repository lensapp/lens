/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { PortForwardStore } from "./port-forward-store";
import type { ForwardedPort } from "../port-forward-item";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";

const portForwardStoreInjectable = getInjectable({
  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    const storage = createStorage<ForwardedPort[] | undefined>(
      "port_forwards",
      undefined,
    );

    return new PortForwardStore({ storage });
  },

  lifecycle: lifecycleEnum.singleton,
});

export default portForwardStoreInjectable;
