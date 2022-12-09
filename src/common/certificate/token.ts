/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { SelfSignedCert } from "selfsigned";

export const lensProxyCertificateInjectionToken = getInjectionToken<SelfSignedCert>({
  id: "lens-proxy-certificate-token",
});
