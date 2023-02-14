/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { BundledInstalledExtension, ExternalInstalledExtension } from "../extension-discovery/extension-discovery";
import type { BundledLensExtensionContructor, LensExtension, LensExtensionConstructor } from "../lens-extension";

export interface CreateExtensionInstance {
  (ExtensionClass: LensExtensionConstructor, extension: ExternalInstalledExtension): LensExtension;
  (ExtensionClass: BundledLensExtensionContructor, extension: BundledInstalledExtension): LensExtension;
}

export const createExtensionInstanceInjectionToken = getInjectionToken<CreateExtensionInstance>({
  id: "create-extension-instance-token",
});
