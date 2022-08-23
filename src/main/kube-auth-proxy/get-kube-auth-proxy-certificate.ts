/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type * as selfsigned from "selfsigned";
import { getOrInsertWith } from "../../common/utils";

type SelfSignedGenerate = typeof selfsigned.generate;

const certCache = new Map<string, selfsigned.SelfSignedCert>();

export function getKubeAuthProxyCertificate(hostname: string, generate: SelfSignedGenerate): selfsigned.SelfSignedCert {
  return getOrInsertWith(certCache, hostname, () => generate(
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
  ));
}
