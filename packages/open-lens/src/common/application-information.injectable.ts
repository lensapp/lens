/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import packageJson from "../../package.json";
import { applicationInformationToken } from "@k8slens/application";

const applicationInformationInjectable = getInjectable({
  id: "application-information",
  instantiate: () => {
    const {
      version,
      config: {
        bundledHelmVersion,
        bundledKubectlVersion,
        contentSecurityPolicy,
        k8sProxyVersion,
        sentryDsn,
        welcomeRoute,
      },
      productName,
      build,
      copyright,
      description,
      name,
      dependencies,
    } = packageJson;

    return {
      version,
      productName,
      copyright,
      description,
      name,
      k8sProxyVersion,
      bundledKubectlVersion,
      bundledHelmVersion,
      sentryDsn,
      contentSecurityPolicy,
      welcomeRoute,
      updatingIsEnabled: (build as any)?.publish?.length > 0,
      dependencies,
    };
  },
  causesSideEffects: true,
  injectionToken: applicationInformationToken,
});

export default applicationInformationInjectable;
