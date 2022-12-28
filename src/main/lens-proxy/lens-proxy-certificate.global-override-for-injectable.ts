/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { SelfSignedCert } from "selfsigned";
import { getGlobalOverride } from "../../common/test-utils/get-global-override";
import lensProxyCertificateInjectable from "./lens-proxy-certificate.injectable";

export default getGlobalOverride(lensProxyCertificateInjectable, () => {
  return {
    get: () => ({
      public: "<public-data>",
      private: "<private-data>",
      cert: "<ca-data>",
    }) as SelfSignedCert,
    set: () => null,
  };
});

