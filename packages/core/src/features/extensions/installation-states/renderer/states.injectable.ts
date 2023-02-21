/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { LensExtensionId } from "../../common/installed-extension";

export type InstallationState = ActiveInstallationState | "idle";
export type ActiveInstallationState = "installing" | "uninstalling";

const extensionInstallationStatesInjectable = getInjectable({
  id: "extension-installation-states",
  instantiate: () => observable.map<LensExtensionId, InstallationState>(),
});

export default extensionInstallationStatesInjectable;
