/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensExtensionManifest } from "@k8slens/legacy-extensions";
import semver from "semver";

interface Dependencies {
  extensionApiVersion: string;
}

export const isCompatibleExtension = ({ extensionApiVersion }: Dependencies): ((manifest: LensExtensionManifest) => boolean) => {
  return (manifest: LensExtensionManifest): boolean => {
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
    }) as semver.SemVer;
    const supportedVersionsByExtension = semver.validRange(`^${extMajor}.${extMinor}`) as string;

    return semver.satisfies(extensionApiVersion, supportedVersionsByExtension, {
      loose: true,
      includePrerelease: false,
    });
  };
};
