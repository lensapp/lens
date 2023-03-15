/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensExtensionManifest } from "@k8slens/legacy-extensions";
import { isCompatibleExtension } from "../extension-discovery/is-compatible-extension/is-compatible-extension";

describe("Extension/App versions compatibility checks", () => {
  it("is compatible with exact version matching", () => {
    expect(isCompatible({ extLensEngineVersion: "5.5.0", extensionApiVersion: "5.5.0" })).toBeTruthy();
  });

  it("is compatible with upper %PATCH versions of base app", () => {
    expect(isCompatible({ extLensEngineVersion: "5.5.0", extensionApiVersion: "5.5.5" })).toBeTruthy();
  });

  it("is compatible with higher %MINOR version of base app", () => {
    expect(isCompatible({ extLensEngineVersion: "5.5.0", extensionApiVersion: "5.6.0" })).toBeTruthy();
  });

  it("is not compatible with higher %MAJOR version of base app", () => {
    expect(isCompatible({ extLensEngineVersion: "5.6.0", extensionApiVersion: "6.0.0" })).toBeFalsy(); // extension for lens@5 not compatible with lens@6
    expect(isCompatible({ extLensEngineVersion: "6.0.0", extensionApiVersion: "5.6.0" })).toBeFalsy();
  });

  it("supports short version format for manifest.engines.lens", () => {
    expect(isCompatible({ extLensEngineVersion: "5.5", extensionApiVersion: "5.5.1" })).toBeTruthy();
  });

  it("throws for incorrect or not supported version format", () => {
    expect(() => isCompatible({
      extLensEngineVersion: ">=2.0",
      extensionApiVersion: "2.0",
    })).toThrow(/Invalid format/i);

    expect(() => isCompatible({
      extLensEngineVersion: "~2.0",
      extensionApiVersion: "2.0",
    })).toThrow(/Invalid format/i);

    expect(() => isCompatible({
      extLensEngineVersion: "*",
      extensionApiVersion: "1.0",
    })).toThrow(/Invalid format/i);
  });
});

function isCompatible({ extLensEngineVersion = "^1.0", extensionApiVersion = "1.0" } = {}): boolean {
  const extensionManifestMock = getExtensionManifestMock(extLensEngineVersion);

  return isCompatibleExtension({ extensionApiVersion })(extensionManifestMock);
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
