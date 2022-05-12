/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import semver, { type SemVer } from "semver";
import type { LensExtensionManifest } from "../../lens-extension";

interface Dependencies {
  appSemVer: SemVer;
}

export const isCompatibleExtension = ({ appSemVer }: Dependencies): ((manifest: LensExtensionManifest) => boolean) => {
  return (manifest: LensExtensionManifest): boolean => {
    const appVersion = appSemVer.raw.split("-")[0]; // drop prerelease version if any, e.g. "-alpha.0"
    const manifestLensEngine = manifest.engines.lens;
    const lensEngine = semver.coerce(manifestLensEngine, {
      loose: true,
      includePrerelease: false,
    });

    if (!lensEngine) {
      const errorInfo = [
        `Invalid format for "manifest.engines.lens"="${manifestLensEngine}"`,
        `Range versions can only be specified starting with '^'.`,
        `Otherwise it's recommended to use plain %MAJOR.%MINOR to match with supported Lens version.`,
      ].join("\n");

      throw new Error(errorInfo);
    }

    const { major: extMajor, minor: extMinor } = lensEngine;
    const supportedRange = `^${extMajor}.${extMinor}`;
    const supportedVersionsByExtension = semver.validRange(supportedRange);

    assert(supportedVersionsByExtension, `${supportedRange} should always be a valid semver range`);

    return semver.satisfies(appVersion, supportedVersionsByExtension, {
      loose: true,
      includePrerelease: false,
    });
  };
};
