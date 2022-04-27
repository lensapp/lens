/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const lensProxyPortNumberStateInjectable = getInjectable({
  id: "lens-proxy-port-number-state",

  instantiate: () => {
    let _portNumber: number;

    return {
      get: () => {
        if (!_portNumber) {
          throw new Error(
            "Tried to access port number of LensProxy while it has not been set yet.",
          );
        }

        return _portNumber;
      },
      set: (portNumber: number) => {
        if (_portNumber) {
          throw new Error(
            "Tried to set port number for LensProxy when it has already been set.",
          );
        }

        _portNumber = portNumber;
      },
    };
  },
});

export default lensProxyPortNumberStateInjectable;
