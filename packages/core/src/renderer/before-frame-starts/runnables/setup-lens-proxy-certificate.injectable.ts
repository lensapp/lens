/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsFirstInjectionToken } from "../tokens";
import lensProxyCertificateInjectable from "../../../common/certificate/lens-proxy-certificate.injectable";
import requestLensProxyCertificateInjectable from "../../certificate/request-lens-proxy-certificate.injectable";

const setupLensProxyCertificateInjectable = getInjectable({
  id: "setup-lens-proxy-certificate",
  instantiate: (di) => ({
    run: async () => {
      const requestLensProxyCertificate = di.inject(requestLensProxyCertificateInjectable);
      const lensProxyCertificate = di.inject(lensProxyCertificateInjectable);

      lensProxyCertificate.set(await requestLensProxyCertificate());
    },
  }),
  injectionToken: beforeFrameStartsFirstInjectionToken,
});

export default setupLensProxyCertificateInjectable;
