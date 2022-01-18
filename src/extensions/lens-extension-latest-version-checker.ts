/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensExtensionManifest } from "./lens-extension";
import type { LensExtensionAvailableUpdate } from "./lens-extension-update-checker";

export interface LensExtensionLatestVersionChecker {
  getLatestVersion(manifest: LensExtensionManifest): Promise<LensExtensionAvailableUpdate>
}
