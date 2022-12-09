/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SelfSignedCert } from "selfsigned";

const lensProxyCertificateStateInjectable = getInjectable({
  id: "lens-proxy-certificate-state",
  instantiate: () => {
    let state: SelfSignedCert | undefined = undefined;

    return {
      get: () => {
        if (!state) {
          throw new Error("Tried to use lensProxyCertificate before initialization");
        }

        return state;
      },
      set: (cert: SelfSignedCert) => {
        if (state) {
          throw new Error("Tried to initialize lensProxyCertificate more than once");
        }

        state = cert;
      },
    };
  },
});

export default lensProxyCertificateStateInjectable;
