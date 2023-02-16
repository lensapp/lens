/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { setExtensionAsInstallingInjectionToken } from "../common/tokens";
import extensionInstallationStatesInjectable from "./states.injectable";

const setExtensionAsInstallingInjectable = getInjectable({
  id: "set-extension-as-installing",
  instantiate: (di) => {
    const states = di.inject(extensionInstallationStatesInjectable);

    return (id) => states.set(id, "installing");
  },
  injectionToken: setExtensionAsInstallingInjectionToken,
});

export default setExtensionAsInstallingInjectable;
