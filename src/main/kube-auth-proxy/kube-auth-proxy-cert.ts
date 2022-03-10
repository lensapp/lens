/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import type * as selfsigned from "selfsigned";

type SelfSignedGenerate = typeof selfsigned.generate;

export function getKubeAuthProxyCertificate(generate: SelfSignedGenerate): selfsigned.SelfSignedCert {
  const opts = [
    { name: "commonName", value: "Lens Certificate Authority" },
    { name: "organizationName", value: "Lens" },
  ];

  return generate(opts, {
    keySize: 2048,
    algorithm: "sha256",
    days: 365,
    extensions: [
      { name: "basicConstraints", cA: true },
      { name: "subjectAltName", altNames: [
        { type: 2, value: "localhost" },
        { type: 7, ip: "127.0.0.1" },
      ] },
    ],
  });
}

export function getKubeAuthProxyCertificatePath(baseDir: string) {
  return path.join(baseDir, "kube-auth-proxy");
}
