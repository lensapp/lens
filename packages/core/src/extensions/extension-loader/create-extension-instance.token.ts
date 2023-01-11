/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { InstalledExtension } from "../extension-discovery/extension-discovery";
import type { LensExtension, LensExtensionConstructor } from "../lens-extension";

export type CreateExtensionInstance = (ExtensionClass: LensExtensionConstructor, extension: InstalledExtension) => LensExtension;

export const createExtensionInstanceInjectionToken = getInjectionToken<CreateExtensionInstance>({
  id: "create-extension-instance-token",
});
