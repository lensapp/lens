/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SelfSignedCert } from "selfsigned";
import { lensProxyCertificateChannel } from "../../common/certificate/lens-proxy-certificate-channel";
import { lensProxyCertificateInjectionToken } from "../../common/certificate/lens-proxy-certificate-injection-token";
import requestFromChannelInjectable from "../utils/channel/request-from-channel.injectable";

const lensProxyCertificateInjectable = getInjectable({
  id: "lens-proxy-certificate",
  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    let certState: SelfSignedCert;
    const cert = {
      get: () => {
        if (!certState) {
          throw "certificate has not been set";
        }

        return certState;
      },
      set: (certificate: SelfSignedCert) => {
        certState = certificate;
      },
    };
    
    requestFromChannel(lensProxyCertificateChannel).then((value) => {
      cert.set(value);
    });

    return cert;
  },
  injectionToken: lensProxyCertificateInjectionToken,
});

export default lensProxyCertificateInjectable;
