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
    const appVersion = appSemVer.raw.split("-")[0]; // drop prerelease version if any, e.g. "-alpha.0"
    const manifestLensEngine = manifest.engines.lens;
    const validVersion = manifestLensEngine.match(/^[\^0-9]\d*\.\d+\b/); // must start from ^ or number

    if (!validVersion) {
      const errorInfo = [
        `Invalid format for "manifest.engines.lens"="${manifestLensEngine}"`,
        `Range versions can only be specified starting with '^'.`,
        `Otherwise it's recommended to use plain %MAJOR.%MINOR to match with supported Lens version.`,
      ].join("\n");

      throw new Error(errorInfo);
    }

    const { major: extMajor, minor: extMinor } = semver.coerce(manifestLensEngine, {
      loose: true,
      includePrerelease: false,
    });
    const supportedVersionsByExtension: string = semver.validRange(`^${extMajor}.${extMinor}`);

    return semver.satisfies(appVersion, supportedVersionsByExtension, {
      loose: true,
      includePrerelease: false,
    });
  };
};
