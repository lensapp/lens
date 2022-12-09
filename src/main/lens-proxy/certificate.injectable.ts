/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { generate } from "selfsigned";
import { lensProxyCertificateInjectionToken } from "../../common/certificate/token";

const lensProxyCertificateInjectable = getInjectable({
  id: "lens-proxy-certificate",
  instantiate: () => generate([
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
          { type: 2, value: "*.localhost" },
          { type: 2, value: "localhost" },
          { type: 7, ip: "127.0.0.1" },
        ],
      },
    ],
  }),
  injectionToken: lensProxyCertificateInjectionToken,
});

export default lensProxyCertificateInjectable;
