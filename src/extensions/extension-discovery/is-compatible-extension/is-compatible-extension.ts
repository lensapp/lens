/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
