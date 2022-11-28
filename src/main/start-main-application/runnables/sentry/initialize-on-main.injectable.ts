/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { init } from "@sentry/electron/main";

const initializeSentryOnMainInjectable = getInjectable({
  id: "initialize-sentry-on-main",
  instantiate: () => init,
  causesSideEffects: true,
});

export default initializeSentryOnMainInjectable;
