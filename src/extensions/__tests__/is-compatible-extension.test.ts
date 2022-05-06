/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import semver from "semver";
import {
  isCompatibleExtension,
} from "../extension-discovery/is-compatible-extension/is-compatible-extension";
import type { LensExtensionManifest } from "../lens-extension";

describe("Extension/App versions compatibility check", () => {
  it("is compatible with exact version matching", () => {
    expect(isCompatibleExtension({
      appSemVer: semver.coerce("5.5.0"), // current app version
    })(getExtensionManifestMock({
      lensEngine: "5.5.0", // requested app version by extension ("semver"-format)
    }))).toBeTruthy();
  });

  it("is compatible with higher patch-versions of main app", () => {
    expect(isCompatibleExtension({
      appSemVer: semver.coerce("5.5.5"), // for patch-versions
    })(getExtensionManifestMock({
      lensEngine: "^5.5.0",
    }))).toBeTruthy();
  });

  it("supports short versions format for engines.lens", () => {
    const isCompatible = isCompatibleExtension({
      appSemVer: semver.coerce("5.5.0"),
    })(getExtensionManifestMock({
      lensEngine: "5.5",
    }));

    expect(isCompatible).toBeTruthy();
  });

  it("supporting `manifest.engines.lens='*'` to match any base-app version", () => {
    expect(isCompatibleExtension({
      appSemVer: semver.coerce("1.0.0"),
    })(getExtensionManifestMock({
      lensEngine: "*",
    }))).toBeTruthy();

    expect(isCompatibleExtension({
      appSemVer: semver.coerce("2.0.0"),
    })(getExtensionManifestMock({
      lensEngine: "*",
    }))).toBeTruthy();
  });
});

function getExtensionManifestMock(
  {
    lensEngine = "1.0",
  } = {}): LensExtensionManifest {
  return {
    name: "some-extension",
    version: "1.0",
    engines: {
      lens: lensEngine,
    },
  };
}
