/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { generate } from "selfsigned";
import lensProxyCertificateInjectable from "../../../common/certificate/lens-proxy-certificate.injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";

const setupLensProxyCertificateInjectable = getInjectable({
  id: "setup-lens-proxy-certificate",

  instantiate: (di) => ({
    run: () => {
      const lensProxyCertificate = di.inject(lensProxyCertificateInjectable);

      const cert = generate([
        { name: "commonName", value: "Lens Certificate Authority" },
        { name: "organizationName", value: "Lens" },
      ], {
        keySize: 2048,
        algorithm: "sha256",
        days: 365,
        extensions: [
          {
            name: "basicConstraints",
            cA: true,
          },
          {
            name: "subjectAltName",
            altNames: [
              { type: 2, value: "*.lens.app" },
              { type: 2, value: "lens.app" },
              { type: 2, value: "localhost" },
              { type: 7, ip: "127.0.0.1" },
            ],
          },
        ],
      });

      lensProxyCertificate.set(cert);

      return undefined;
    },
  }),

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupLensProxyCertificateInjectable;
