/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import semver from "semver";
import {
  isCompatibleExtension,
} from "../extension-discovery/is-compatible-extension/is-compatible-extension";
import type { LensExtensionManifest } from "../lens-extension";

describe("Extension/App versions compatibility checks", () => {
  it("is compatible with exact version matching", () => {
    expect(isCompatible("5.5.0", "5.5.0")).toBeTruthy();
  });

  it("is compatible with upper %PATCH versions of base app", () => {
    expect(isCompatible("5.5.0", "5.5.5")).toBeTruthy();
  });

  it("is compatible with higher %MINOR version of base app", () => {
    expect(isCompatible("5.5.0", "5.6.0")).toBeTruthy();
  });

  it("is not compatible with higher %MAJOR version of base app", () => {
    expect(isCompatible("5.6.0", "6.0.0")).toBeFalsy(); // extension for lens@5 not compatible with lens@6
    expect(isCompatible("6.0.0", "5.6.0")).toBeFalsy();
  });

  it("is compatible with lensEngine with prerelease", () => {
    expect(isCompatible("^5.4.0-alpha.0", "5.5.0-alpha.0")).toBeTruthy();
  });

  it("supports short version format for manifest.engines.lens", () => {
    expect(isCompatible("5.5.0", "5.5")).toBeTruthy();
  });

  it("throws for incorrect or not supported version format", () => {
    expect(() => isCompatible(">=2.0", "2.0")).toThrow(/Invalid format/i);
    expect(() => isCompatible("~2.0", "2.0")).toThrow(/Invalid format/i);
    expect(() => isCompatible("*", "1.0")).toThrow(/Invalid format/i);
  });
});

function isCompatible(extensionLensEngine = "^1.0", appVersion = "1.0"): boolean {
  const appSemVer = semver.coerce(appVersion);
  const extensionManifestMock = getExtensionManifestMock(extensionLensEngine);

  return isCompatibleExtension({ appSemVer })(extensionManifestMock);
}

function getExtensionManifestMock(lensEngine = "1.0"): LensExtensionManifest {
  return {
    name: "some-extension",
    version: "1.0",
    engines: {
      lens: lensEngine,
    },
  };
}
