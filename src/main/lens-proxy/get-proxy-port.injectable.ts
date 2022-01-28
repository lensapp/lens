/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import proxyPortStateInjectable from "./proxy-port.state.injectable";

const getProxyPortInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(proxyPortStateInjectable);

    return computed(() => {
      const port = state.get();

      if (typeof port !== "number") {
        throw new Error("Proxy port has not yet been set");
      }

      return port;
    });
  },
  lifecycle: lifecycleEnum.singleton,
});

export default getProxyPortInjectable;
