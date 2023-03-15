/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensExtensionConstructor, InstalledExtension } from "@k8slens/legacy-extensions";
import { getInjectionToken } from "@ogre-tools/injectable";
import type { LensExtension } from "../lens-extension";

export type CreateExtensionInstance = (ExtensionClass: LensExtensionConstructor, extension: InstalledExtension) => LensExtension;

export const createExtensionInstanceInjectionToken = getInjectionToken<CreateExtensionInstance>({
  id: "create-extension-instance-token",
});
