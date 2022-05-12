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
      appSemVer: semver.coerce("5.5.0"),
    })(getExtensionManifestMock({
      lensEngine: "5.5.0",
    }))).toBeTruthy();
  });

  it("is compatible with upper %PATCH versions of base app", () => {
    expect(isCompatibleExtension({
      appSemVer: semver.coerce("5.5.5"),
    })(getExtensionManifestMock({
      lensEngine: "5.5.0",
    }))).toBeTruthy();
  });

  it("is compatible with upper %MINOR version of base app", () => {
    expect(isCompatibleExtension({
      appSemVer: semver.coerce("5.6.0"),
    })(getExtensionManifestMock({
      lensEngine: "5.5.0",
    }))).toBeTruthy();

    expect(isCompatibleExtension({
      appSemVer: semver.coerce("5.5.0-alpha.0"),
    })(getExtensionManifestMock({
      lensEngine: "^5.5.0",
    }))).toBeTruthy();

    expect(isCompatibleExtension({
      appSemVer: semver.coerce("5.5"),
    })(getExtensionManifestMock({
      lensEngine: "^5.6.0",
    }))).toBeFalsy();
  });

  it("is not compatible with upper %MAJOR version of base app", () => {
    expect(isCompatibleExtension({
      appSemVer: semver.coerce("5.5.0"), // current lens-version
    })(getExtensionManifestMock({
      lensEngine: "6.0.0",
    }))).toBeFalsy(); // extension with lens@6.0 is not compatible with app@5.5

    expect(isCompatibleExtension({
      appSemVer: semver.coerce("6.0.0"), // current lens-version
    })(getExtensionManifestMock({
      lensEngine: "5.5.0",
    }))).toBeFalsy(); // extension with lens@5.5 is not compatible with app@6.0
  });

  it("is compatible with lensEngine with prerelease", () => {
    expect(isCompatibleExtension({
      appSemVer: semver.parse("5.5.0-alpha.0"),
    })(getExtensionManifestMock({
      lensEngine: "^5.4.0-alpha.0",
    }))).toBeTruthy();
  });

  describe("supported formats for manifest.engines.lens", () => {
    it("short version format for engines.lens", () => {
      expect(isCompatibleExtension({
        appSemVer: semver.coerce("5.5.0"),
      })(getExtensionManifestMock({
        lensEngine: "5.5",
      }))).toBeTruthy();
    });

    it("validates version and throws if incorrect format", () => {
      expect(() => isCompatibleExtension({
        appSemVer: semver.coerce("1.0.0"),
      })(getExtensionManifestMock({
        lensEngine: "1.0",
      }))).not.toThrow();

      expect(() => isCompatibleExtension({
        appSemVer: semver.coerce("1.0.0"),
      })(getExtensionManifestMock({
        lensEngine: "^1.0",
      }))).not.toThrow();

      expect(() => isCompatibleExtension({
        appSemVer: semver.coerce("1.0.0"),
      })(getExtensionManifestMock({
        lensEngine: ">=2.0",
      }))).toThrow(/Invalid format/i);
    });

    it("'*' cannot be used for any version matching (at least in the prefix)", () => {
      expect(() => isCompatibleExtension({
        appSemVer: semver.coerce("1.0.0"),
      })(getExtensionManifestMock({
        lensEngine: "*",
      }))).toThrowError(/Invalid format/i);
    });
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
