export type LensExtensionId = string;
export type LensExtensionConstructor = new (
  ext: InstalledExtension
) => LegacyLensExtension;

export interface InstalledExtension {
  id: LensExtensionId;

  readonly manifest: LensExtensionManifest;

  // Absolute path to the non-symlinked source folder,
  // e.g. "/Users/user/.k8slens/extensions/helloworld"
  readonly absolutePath: string;

  /**
   * Absolute to the symlinked package.json file
   */
  readonly manifestPath: string;
  readonly isBundled: boolean;
  readonly isCompatible: boolean;
  isEnabled: boolean;
}

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

export interface LensExtensionManifest {
  name: string;
  version: string;
  description?: string;

  main?: string; // path to %ext/dist/main.js
  renderer?: string; // path to %ext/dist/renderer.js
  /**
   * Supported Lens version engine by extension could be defined in `manifest.engines.lens`
   * Only MAJOR.MINOR version is taken in consideration.
   */
  engines: {
    lens: string; // "semver"-package format
    npm?: string;
    node?: string;
  };

  /**
   * Specify extension name used for persisting data.
   * Useful if extension is renamed but the data should not be lost.
   */
  storeName?: string;
}
