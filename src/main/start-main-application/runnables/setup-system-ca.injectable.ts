/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../runnable-tokens/before-application-is-loading-injection-token";
import injectSystemCAsInjectable from "../../../common/certificate-authorities/inject-system-cas.injectable";

const setupSystemCaInjectable = getInjectable({
  id: "setup-system-ca",
  instantiate: (di) => ({
    id: "setup-system-ca",
    run: di.inject(injectSystemCAsInjectable),
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupSystemCaInjectable;
