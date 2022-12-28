/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { SelfSignedCert } from "selfsigned";

interface LensProxyCertificateValue {
  get: () => SelfSignedCert;
  set: (cert: SelfSignedCert) => void;
}

export const lensProxyCertificateInjectionToken = getInjectionToken<LensProxyCertificateValue>({
  id: "lens-proxy-certificate-token",
});
