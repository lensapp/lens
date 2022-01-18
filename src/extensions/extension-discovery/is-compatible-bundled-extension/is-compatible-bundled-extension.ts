/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensExtensionManifest } from "../../lens-extension";
import { isProduction } from "../../../common/vars";
import type { SemVer } from "semver";

interface Dependencies {
  appSemVer: SemVer;
}

export const isCompatibleBundledExtension =
  ({ appSemVer }: Dependencies) =>
    (manifest: LensExtensionManifest): boolean =>
      !isProduction || manifest.version === appSemVer.raw;
