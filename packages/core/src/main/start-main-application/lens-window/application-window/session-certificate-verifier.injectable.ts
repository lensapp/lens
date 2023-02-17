/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { timingSafeEqual, X509Certificate } from "crypto";
import type { Request } from "electron";
import lensProxyCertificateInjectable from "../../../../common/certificate/lens-proxy-certificate.injectable";

// see https://www.electronjs.org/docs/latest/api/session#sessetcertificateverifyprocproc
export enum ChromiumNetError {
  SUCCESS = 0,
  FAILURE = -2,
  RESULT_FROM_CHROMIUM = -3,
}

export type CertificateVerificationCallback = (error: ChromiumNetError) => void;

const sessionCertificateVerifierInjectable = getInjectable({
  id: "session-certificate-verifier",
  instantiate: (di) => {
    const lensProxyCertificate = di.inject(lensProxyCertificateInjectable).get();
    const lensProxyX509Cert = new X509Certificate(lensProxyCertificate.cert);

    return (request: Request, shouldBeTrusted: CertificateVerificationCallback) => {
      const { certificate } = request;
      const cert = new X509Certificate(certificate.data);
      const shouldTrustCert = cert.raw.length === lensProxyX509Cert.raw.length
        && timingSafeEqual(cert.raw, lensProxyX509Cert.raw);
  
      shouldBeTrusted(shouldTrustCert ? ChromiumNetError.SUCCESS : ChromiumNetError.RESULT_FROM_CHROMIUM);
    };
  },
});

export default sessionCertificateVerifierInjectable;
