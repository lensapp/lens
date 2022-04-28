/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SelfSignedCert } from "selfsigned";
import { getOrInsertWith } from "../../common/utils";
import kubeAuthCertCacheInjectable from "./cert-cache.injectable";
import generateCertificateInjectable from "./generate-cert.injectable";

export type GetKubeAuthProxyCertificate = (hostname: string) => SelfSignedCert;

const getKubeAuthProxyCertificateInjectable = getInjectable({
  id: "get-kube-auth-proxy-certificate",
  instantiate: (di): GetKubeAuthProxyCertificate => {
    const cache = di.inject(kubeAuthCertCacheInjectable);
    const generate = di.inject(generateCertificateInjectable);

    return (hostname) => getOrInsertWith(cache, hostname, () => (
      generate(
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
            { name: "subjectAltName", altNames: [
              { type: 2, value: hostname },
              { type: 2, value: "localhost" },
              { type: 7, ip: "127.0.0.1" },
            ] },
          ],
        },
      )
    ));
  },
});

export default getKubeAuthProxyCertificateInjectable;
