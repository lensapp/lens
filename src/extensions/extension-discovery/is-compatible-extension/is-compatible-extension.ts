/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import semver, { SemVer } from "semver";
import type { LensExtensionManifest } from "../../lens-extension";

interface Dependencies {
  appSemVer: SemVer;
}

export const isCompatibleExtension = ({
  appSemVer,
}: Dependencies): ((manifest: LensExtensionManifest) => boolean) => {
  const { major, minor, patch, prerelease: oldPrelease } = appSemVer;
  let prerelease = "";

  if (oldPrelease.length > 0) {
    const [first] = oldPrelease;

    if (first === "alpha" || first === "beta" || first === "rc") {
      /**
       * Strip the build IDs and "latest" prerelease tag as that is not really
       * a part of API version
       */
      prerelease = `-${oldPrelease.slice(0, 2).join(".")}`;
    }
  }

  /**
   * We unfortunately have to format as string because the constructor only
   * takes an instance or a string.
   */
  const strippedVersion = new SemVer(
    `${major}.${minor}.${patch}${prerelease}`,
    { includePrerelease: true },
  );

  return (manifest: LensExtensionManifest): boolean => {
    if (manifest.engines?.lens) {
      /**
       * include Lens's prerelease tag in the matching so the extension's
       * compatibility is not limited by it
       */
      return semver.satisfies(strippedVersion, manifest.engines.lens, {
        includePrerelease: true,
      });
    }

    return false;
  };
};
