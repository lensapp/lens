/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensExtensionId } from "../../common/installed-extension";
import type { InstallationState } from "./states.injectable";
import extensionInstallationStatesInjectable from "./states.injectable";

export type GetExtensionInstallationPhase = (id: LensExtensionId) => InstallationState;

const getExtensionInstallationPhaseInjectable = getInjectable({
  id: "get-extension-installation-phase",
  instantiate: (di): GetExtensionInstallationPhase => {
    const states = di.inject(extensionInstallationStatesInjectable);

    return (id) => states.get(id) ?? "idle";
  },
});

export default getExtensionInstallationPhaseInjectable;
