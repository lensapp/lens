/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const resolveProxyFromElectronInjectable = getInjectable({
  id: "resolve-proxy-from-electron",

  instantiate: () => async (url: string) => "not-implemented-yet",

  causesSideEffects: true,
});

export default resolveProxyFromElectronInjectable;
