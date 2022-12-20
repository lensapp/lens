/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import applicationInformationToken from "./application-information-token";

const applicationInformationForTestingInjectable = getInjectable({
  id: "application-information-for-testing",
  injectionToken: applicationInformationToken,
  instantiate: () => ({
    name: "some-product-name",
    productName: "some-product-name",
    version: "6.0.0",
    build: {},
    config: {
      k8sProxyVersion: "0.2.1",
      bundledKubectlVersion: "1.23.3",
      bundledHelmVersion: "3.7.2",
      sentryDsn: "",
      contentSecurityPolicy: "script-src 'unsafe-eval' 'self'; frame-src http://*.localhost:*/; img-src * data:",
      welcomeRoute: "/welcome",
      extensions: [],
    },
    copyright: "some-copyright-information",
    description: "some-descriptive-text",
  }),
  causesSideEffects: false,
});

export default applicationInformationForTestingInjectable;
