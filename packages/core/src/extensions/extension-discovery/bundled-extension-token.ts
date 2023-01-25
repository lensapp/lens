/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { LensExtensionConstructor, LensExtensionManifest } from "../lens-extension";

export interface BundledExtension {
  readonly manifest: LensExtensionManifest;
  main: () => LensExtensionConstructor | null;
  renderer: () => LensExtensionConstructor | null;
}

export const bundledExtensionInjectionToken = getInjectionToken<BundledExtension>({
  id: "bundled-extension-path",
});
