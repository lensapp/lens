export type LensExtensionId = string;

export type LensExtensionConstructor = new (
  ext: InstalledExtension
) => LegacyLensExtension;
export type BundledLensExtensionConstructor = new (
  ext: BundledInstalledExtension
) => LegacyLensExtension;

export interface BaseInstalledExtension {
  readonly id: LensExtensionId;
  // Absolute path to the non-symlinked source folder,
  // e.g. "/Users/user/.k8slens/extensions/helloworld"
  readonly absolutePath: string;
  // Absolute to the symlinked package.json file
  readonly manifestPath: string;
}

export interface BundledInstalledExtension extends BaseInstalledExtension {
  readonly manifest: BundledLensExtensionManifest;
  readonly isBundled: true;
  readonly isCompatible: true;
  readonly isEnabled: true;
}

export interface ExternalInstalledExtension extends BaseInstalledExtension {
  readonly manifest: LensExtensionManifest;
  readonly isBundled: false;
  readonly isCompatible: boolean;
  isEnabled: boolean;
}

export type InstalledExtension =
  | BundledInstalledExtension
  | ExternalInstalledExtension;

export interface LegacyLensExtension {
  readonly id: LensExtensionId;
  readonly manifest: LensExtensionManifest;
  readonly manifestPath: string;
  readonly isBundled: boolean;
  readonly sanitizedExtensionId: string;
  readonly name: string;
  readonly version: string;
  readonly description: string | undefined;
  readonly storeName: string;

  getExtensionFileFolder(): Promise<string>;
  enable(): Promise<void>;
  disable(): Promise<void>;
  activate(): Promise<void>;
}

export interface BundledLensExtensionManifest {
  name: string;
  version: string;
  description?: string;
  publishConfig?: Partial<Record<string, string>>;

  /**
   * Specify extension name used for persisting data.
   * Useful if extension is renamed but the data should not be lost.
   */
  storeName?: string;
}

export interface LensExtensionManifest extends BundledLensExtensionManifest {
  main?: string; // path to %ext/dist/main.js
  renderer?: string; // path to %ext/dist/renderer.js

  /**
   * Supported Lens version engine by extension could be defined in `manifest.engines.lens`
   * Only MAJOR.MINOR version is taken in consideration.
   */
  engines: {
    lens: string; // "semver"-package format
    [x: string]: string | undefined;
  };
}
