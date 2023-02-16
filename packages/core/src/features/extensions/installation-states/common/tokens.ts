/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { LensExtensionId } from "../../../../extensions/lens-extension";

export type SetExtensionAsInstalling = (id: LensExtensionId) => void;

export const setExtensionAsInstallingInjectionToken = getInjectionToken<SetExtensionAsInstalling>({
  id: "set-extension-as-installing-token",
});

export type ClearExtensionAsInstalling = (id: LensExtensionId) => void;

export const clearExtensionAsInstallingInjectionToken = getInjectionToken<ClearExtensionAsInstalling>({
  id: "clear-extension-as-installing-token",
});
