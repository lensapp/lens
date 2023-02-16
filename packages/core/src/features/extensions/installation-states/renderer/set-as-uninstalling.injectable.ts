/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { LensExtensionId } from "../../../../extensions/lens-extension";
import extensionInstallationStatesInjectable from "./states.injectable";

export type SetExtensionAsUninstalling = (id: LensExtensionId) => void;

const setExtensionAsUninstallingInjectable = getInjectable({
  id: "set-extension-as-uninstalling",
  instantiate: (di): SetExtensionAsUninstalling => {
    const states = di.inject(extensionInstallationStatesInjectable);

    return (id) => states.set(id, "uninstalling");
  },
});

export default setExtensionAsUninstallingInjectable;
