/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PackageJson } from "type-fest";

export interface BaseInstalledExtension {
  readonly id: LensExtensionId;
}

export interface BundledInstalledExtension extends BaseInstalledExtension {
  readonly manifest: BundledLensExtensionManifest;
  readonly isBundled: true;
  readonly isCompatible: true;
  readonly isEnabled: true;
}

export interface ExternalInstalledExtension extends BaseInstalledExtension {
  // Absolute path to the non-symlinked source folder,
  // e.g. "/Users/user/.k8slens/extensions/helloworld"
  readonly absolutePath: string;
  // Absolute to the symlinked package.json file
  readonly manifestPath: string;
  readonly manifest: LensExtensionManifest;
  readonly isBundled: false;
  readonly isCompatible: boolean;
  isEnabled: boolean;
}

export type InstalledExtension = BundledInstalledExtension | ExternalInstalledExtension;

export interface LensExtensionManifest extends BundledLensExtensionManifest {
  readonly main?: string; // path to %ext/dist/main.js
  readonly renderer?: string; // path to %ext/dist/renderer.js
  /**
   * Supported Lens version engine by extension could be defined in `manifest.engines.lens`
   * Only MAJOR.MINOR version is taken in consideration.
   */
  readonly engines: {
    readonly lens: string; // "semver"-package format
    readonly [x: string]: string | undefined;
  };
}

export type LensExtensionId = string; // path to manifest (package.json)

export interface BundledLensExtensionManifest extends PackageJson {
  readonly name: string;
  readonly version: string;
  readonly publishConfig?: Partial<Record<string, string>>;

  // Specify extension name used for persisting data.
  // Useful if extension is renamed but the data should not be lost.
  readonly storeName?: string;
}
