/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { lensProxyCertificateChannel } from "../../common/certificate/lens-proxy-certificate-channel";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import lensProxyCertificateInjectable from "../../common/certificate/lens-proxy-certificate.injectable";

const lensProxyCertificateRequestHandlerInjectable = getRequestChannelListenerInjectable({
  id: "lens-proxy-certificate-request-handler-listener",
  channel: lensProxyCertificateChannel,
  getHandler: (di) => {
    const lensProxyCertificate = di.inject(lensProxyCertificateInjectable).get();

    return () => ({
      cert: lensProxyCertificate.cert,
      public: lensProxyCertificate.public,
      private: "",
    });
  },
});

export default lensProxyCertificateRequestHandlerInjectable;
