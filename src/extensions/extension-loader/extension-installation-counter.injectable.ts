/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const extensionInstallationCounterInjectable = getInjectable({
  id: "extension-installation-counter",
  instantiate: () => new Map<string, number>(),
});

export default extensionInstallationCounterInjectable;
