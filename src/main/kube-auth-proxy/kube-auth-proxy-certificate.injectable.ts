/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { generate } from "selfsigned";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

const kubeAuthProxyCertificateInjectable = getInjectable({
  id: "kube-auth-proxy-certificate",
  instantiate: (di, hostname) => generate(
    [
      { name: "commonName", value: "Lens Certificate Authority" },
      { name: "organizationName", value: "Lens" },
    ],
    {
      keySize: 2048,
      algorithm: "sha256",
      days: 365,
      extensions: [
        { name: "basicConstraints", cA: true },
        {
          name: "subjectAltName", altNames: [
            { type: 2, value: hostname },
            { type: 2, value: "localhost" },
            { type: 7, ip: "127.0.0.1" },
          ],
        },
      ],
    },
  ),
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, hostname: string) => hostname,
  }),
});

export default kubeAuthProxyCertificateInjectable;

