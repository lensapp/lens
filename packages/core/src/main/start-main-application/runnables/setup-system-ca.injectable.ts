/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import injectSystemCAsInjectable from "../../../features/certificate-authorities/common/inject-system-cas.injectable";

const setupSystemCaInjectable = getInjectable({
  id: "setup-system-ca",
  instantiate: (di) => ({
    run: async () => {
      const injectSystemCAs = di.inject(injectSystemCAsInjectable);

      await injectSystemCAs();
    },
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupSystemCaInjectable;
