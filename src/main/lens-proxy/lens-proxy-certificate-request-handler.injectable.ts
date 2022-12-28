/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { SelfSignedCert } from "selfsigned";
import { lensProxyCertificateChannel } from "../../common/certificate/lens-proxy-certificate-channel";
import { getRequestChannelListenerInjectable } from "../utils/channel/channel-listeners/listener-tokens";
import lensProxyCertificateInjectable from "./lens-proxy-certificate.injectable";

const lensProxyCertificateRequestHandlerInjectable = getRequestChannelListenerInjectable({
  channel: lensProxyCertificateChannel,
  handler: (di) => {
    const lensProxyCertificate = di.inject(lensProxyCertificateInjectable).get() as SelfSignedCert;

    return () => ({
      cert: lensProxyCertificate.cert,
      public: lensProxyCertificate.public,
      private: "",
    });
  },
});

export default lensProxyCertificateRequestHandlerInjectable;
