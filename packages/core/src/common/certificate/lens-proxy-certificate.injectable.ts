/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import type { SelfSignedCert } from "selfsigned";

const lensProxyCertificateInjectable = getInjectable({
  id: "lens-proxy-certificate",
  instantiate: () => {
    let certState: SelfSignedCert | undefined;
    const cert = {
      get: () => {
        assert(certState, "certificate has not been set");

        return certState;
      },
      set: (certificate: SelfSignedCert) => {
        assert(!certState, "certificate has already been set");

        certState = certificate;
      },
    };

    return cert;
  },
});

export default lensProxyCertificateInjectable;
