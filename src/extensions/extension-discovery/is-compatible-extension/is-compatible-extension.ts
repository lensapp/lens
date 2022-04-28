/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import semver, { SemVer } from "semver";
import type { LensExtensionManifest } from "../../lens-extension";

interface Dependencies {
  appSemVer: SemVer;
}

export const isCompatibleExtension = (deps: Dependencies): ((manifest: LensExtensionManifest) => boolean) => {
  const { major: appVersion } = deps.appSemVer;

  return (manifest: LensExtensionManifest): boolean => {
    if (manifest?.engines.lens) {
      const { major: extMajor, minor: extMinor } = new SemVer(manifest.engines.lens, {
        loose: true,
      });

      return semver.gte(`${extMajor}.${extMinor}`, `${appVersion}.0`);
    }

    return false; // not compatible by default
  };
};
