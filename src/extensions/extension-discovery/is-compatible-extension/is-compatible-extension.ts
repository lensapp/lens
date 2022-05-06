/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import semver, { type SemVer } from "semver";
import type { LensExtensionManifest } from "../../lens-extension";

interface Dependencies {
  appSemVer: SemVer;
}

export const isCompatibleExtension = ({ appSemVer }: Dependencies): ((manifest: LensExtensionManifest) => boolean) => {
  return (manifest: LensExtensionManifest): boolean => {
    const { raw: appVersion } = appSemVer;
    const supportedVersionsByExtension: string = semver.validRange(manifest.engines.lens);

    return semver.satisfies(appVersion, supportedVersionsByExtension, {
      loose: true,
      includePrerelease: false,
    });
  };
};
