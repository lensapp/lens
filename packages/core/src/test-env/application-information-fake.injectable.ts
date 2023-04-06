/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { applicationInformationToken } from "../common/vars/application-information-token";

export const applicationInformationFakeInjectable = getInjectable({
  id: "application-information-fake",

  instantiate: () => ({
    name: "some-product-name",
    productName: "some-product-name",
    version: "6.0.0",
    updatingIsEnabled: false,
    copyright: "some-copyright-information",
    description: "some-descriptive-text",
    dependencies: {},
    build: {},

    config: {
      welcomeRoute: "/welcome",
      bundledKubectlVersion: "1.23.3",
      bundledHelmVersion: "3.7.2",
      k8sProxyVersion: "0.2.1",
      sentryDsn: "",
      contentSecurityPolicy: "script-src 'unsafe-eval' 'self'; frame-src http://*.localhost:*/; img-src * data:",
    },
  }),

  injectionToken: applicationInformationToken,
});
