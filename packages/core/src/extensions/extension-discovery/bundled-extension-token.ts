/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { BundledLensExtensionManifest, BundledLensExtensionContructor } from "../lens-extension";

export interface BundledExtension {
  readonly manifest: BundledLensExtensionManifest;
  main: () => Promise<BundledLensExtensionContructor | null>;
  renderer: () => Promise<BundledLensExtensionContructor | null>;
}

export const bundledExtensionInjectionToken = getInjectionToken<BundledExtension>({
  id: "bundled-extension-path",
});
