/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import platformSpecificVersionInjectable from "../../../common/utils/platform-specific-version.injectable";
import { platformSpecificRequestSystemCAsInjectionToken, requestSystemCAsInjectionToken } from "../common/request-system-cas-token";

const requestSystemCAsInjectable = getInjectable({
  id: "request-system-cas",
  instantiate: (di) => {
    const platformSpecificVersion = di.inject(platformSpecificVersionInjectable);
    const platformSpecificRequestSystemCAs = platformSpecificVersion(platformSpecificRequestSystemCAsInjectionToken);

    return platformSpecificRequestSystemCAs ?? (async () => []);
  },
  injectionToken: requestSystemCAsInjectionToken,
});

export default requestSystemCAsInjectable;
