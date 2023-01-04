/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SelfSignedCert } from "selfsigned";
import { lensProxyCertificateInjectionToken } from "../../common/certificate/lens-proxy-certificate-injection-token";

const lensProxyCertificateInjectable = getInjectable({
  id: "lens-proxy-certificate",
  instantiate: () => {
    let certState: SelfSignedCert;

    return {
      get: () => certState,
      set: (cert: SelfSignedCert): void => {
        if (certState) {
          throw "cannot override cert";
        }
        certState = cert;
      },
    };
  },
  injectionToken: lensProxyCertificateInjectionToken,
  causesSideEffects: true,
});

export default lensProxyCertificateInjectable;
