/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { SemVer } from "semver";
import semver from "semver";
import type { LensExtensionManifest } from "../../lens-extension";

interface Dependencies {
  appSemVer: SemVer;
}

export const isCompatibleExtension = (deps: Dependencies): ((manifest: LensExtensionManifest) => boolean) => {
  const { major: appMajor } = deps.appSemVer;

  return (manifest: LensExtensionManifest): boolean => {
    if (manifest?.engines.lens) {
      const [extMajor, extMinor] = manifest.engines.lens.split(".");

      return semver.gte(`${extMajor}.${extMinor}`, `${appMajor}.0`);
    }

    // all extensions by default should be compatible with any Lens-engine (if not specified)
    return true;
  };
};
