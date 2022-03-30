/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type * as selfsigned from "selfsigned";

type SelfSignedGenerate = typeof selfsigned.generate;

const certCache: Map<string, selfsigned.SelfSignedCert> = new Map();

export function getKubeAuthProxyCertificate(hostname: string, generate: SelfSignedGenerate, useCache = true): selfsigned.SelfSignedCert {
  if (useCache && certCache.has(hostname)) {
    return certCache.get(hostname);
  }

  const opts = [
    { name: "commonName", value: "Lens Certificate Authority" },
    { name: "organizationName", value: "Lens" },
  ];

  const cert = generate(opts, {
    keySize: 2048,
    algorithm: "sha256",
    days: 365,
    extensions: [
      { name: "basicConstraints", cA: true },
      { name: "subjectAltName", altNames: [
        { type: 2, value: hostname },
        { type: 2, value: "localhost" },
        { type: 7, ip: "127.0.0.1" },
      ] },
    ],
  });

  certCache.set(hostname, cert);

  return cert;
}
