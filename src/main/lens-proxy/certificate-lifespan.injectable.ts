/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const lensProxyCertificateLifespanInjectable = getInjectable({
  id: "lens-proxy-certificate-lifespan",
  instantiate: () => 365, // days
});

export default lensProxyCertificateLifespanInjectable;
