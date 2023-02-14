/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensExtensionConstructor, BundledInstalledExtension, ExternalInstalledExtension, BundledLensExtensionConstructor } from "@k8slens/legacy-extensions";
import { getInjectionToken } from "@ogre-tools/injectable";
import type { LensExtension } from "../lens-extension";

export interface CreateExtensionInstance {
  (ExtensionClass: LensExtensionConstructor, extension: ExternalInstalledExtension): LensExtension;
  (ExtensionClass: BundledLensExtensionConstructor, extension: BundledInstalledExtension): LensExtension;
}

export const createExtensionInstanceInjectionToken = getInjectionToken<CreateExtensionInstance>({
  id: "create-extension-instance-token",
});
