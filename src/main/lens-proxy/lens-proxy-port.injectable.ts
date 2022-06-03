/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const lensProxyPortInjectable = getInjectable({
  id: "lens-proxy-port",

  instantiate: () => {
    let portNumber: number;

    return {
      get: () => {
        if (!portNumber) {
          throw new Error(
            "Tried to access port number of LensProxy while it has not been set yet.",
          );
        }

        return portNumber;
      },

      set: (port: number) => {
        if (portNumber) {
          throw new Error(
            "Tried to set port number for LensProxy when it has already been set.",
          );
        }

        portNumber = port;
      },
    };
  },
});

export default lensProxyPortInjectable;
