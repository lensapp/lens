/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { clearExtensionAsInstallingInjectionToken } from "../common/tokens";
import extensionInstallationStatesInjectable from "./states.injectable";

const clearExtensionAsInstallingInjectable = getInjectable({
  id: "clear-extension-as-installing",
  instantiate: (di) => {
    const states = di.inject(extensionInstallationStatesInjectable);

    return (id) => states.delete(id);
  },
  injectionToken: clearExtensionAsInstallingInjectionToken,
});

export default clearExtensionAsInstallingInjectable;
