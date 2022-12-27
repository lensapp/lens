/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../common/test-utils/get-global-override";
import applicationInformationInjectable from "../../common/vars/application-information-injectable";

export default getGlobalOverride(applicationInformationInjectable, () => ({
  name: "some-product-name",
  productName: "some-product-name",
  version: "6.0.0",
  build: {} as any,
  config: {
    k8sProxyVersion: "0.2.1",
    bundledKubectlVersion: "1.23.3",
    bundledHelmVersion: "3.7.2",
    sentryDsn: "",
    contentSecurityPolicy: "script-src 'unsafe-eval' 'self'; frame-src http://*.localhost:*/; img-src * data:",
    welcomeRoute: "/welcome",
  },
  copyright: "some-copyright-information",
  description: "some-descriptive-text",
}));
