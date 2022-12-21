/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Agent } from "https";
import { lensProxyCertificateInjectionToken } from "../../../common/certificate/token";

const lensAuthenticatedAgentInjectable = getInjectable({
  id: "lens-authenticated-agent",
  instantiate: (di) => {
    const lensProxyCertificate = di.inject(lensProxyCertificateInjectionToken);

    return new Agent({
      ca: lensProxyCertificate.cert,
    });
  },
});

export default lensAuthenticatedAgentInjectable;
