/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { BundledInstalledExtension, ExternalInstalledExtension, InstalledExtension } from "./extension-discovery/extension-discovery";
import { action, computed, makeObservable, observable } from "mobx";
import { disposer } from "../common/utils";
import type { ProtocolHandlerRegistration } from "../common/protocol-handler/registration";
import type { PackageJson } from "type-fest";
import type { FileSystemProvisionerStore } from "./extension-loader/file-system-provisioner-store/file-system-provisioner-store";
import type { Logger } from "../common/logger";

export type LensExtensionId = string; // path to manifest (package.json)
export type LensExtensionConstructor = new (ext: ExternalInstalledExtension) => LensExtension;
export type BundledLensExtensionContructor = new (ext: BundledInstalledExtension) => LensExtension;

export interface BundledLensExtensionManifest extends PackageJson {
  name: string;
  version: string;
  publishConfig?: Partial<Record<string, string>>;
}

export interface LensExtensionDependencies {
  readonly fileSystemProvisionerStore: FileSystemProvisionerStore;
  readonly logger: Logger;
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

  // Specify extension name used for persisting data.
  // Useful if extension is renamed but the data should not be lost.
  storeName?: string;
}

export const Disposers = Symbol("disposers");

export class LensExtension {
  readonly id: LensExtensionId;
  readonly manifest: LensExtensionManifest;
  readonly manifestPath: string;
  readonly isBundled: boolean;

  get sanitizedExtensionId() {
    return sanitizeExtensionName(this.name);
  }

  /**
   * @ignore
   */
  protected readonly dependencies: LensExtensionDependencies;

  protocolHandlers: ProtocolHandlerRegistration[] = [];

  @observable private _isEnabled = false;

  @computed get isEnabled() {
    return this._isEnabled;
  }

  /**
   * @ignore
   */
  [Disposers] = disposer();

  constructor(deps: LensExtensionDependencies, { id, manifest, manifestPath, isBundled }: InstalledExtension) {
    this.dependencies = deps;
    this.id = id;
    this.manifest = manifest as LensExtensionManifest;
    this.manifestPath = manifestPath;
    this.isBundled = isBundled;
    makeObservable(this);
  }

  get name() {
    return this.manifest.name;
  }

  get version() {
    return this.manifest.version;
  }

  get description() {
    return this.manifest.description;
  }

  // Name of extension for persisting data
  get storeName() {
    return this.manifest.storeName || this.name;
  }

  /**
   * getExtensionFileFolder returns the path to an already created folder. This
   * folder is for the sole use of this extension.
   *
   * Note: there is no security done on this folder, only obfuscation of the
   * folder name.
   */
  async getExtensionFileFolder(): Promise<string> {
    // storeName is read from the manifest and has a fallback to the manifest name, which equals id
    return this.dependencies.fileSystemProvisionerStore.requestDirectory(this.storeName);
  }

  @action
  async enable() {
    if (this._isEnabled) {
      return;
    }

    this._isEnabled = true;
    this.dependencies.logger.info(`[EXTENSION]: enabled ${this.name}@${this.version}`);
  }

  @action
  async disable() {
    if (!this._isEnabled) {
      return;
    }

    this._isEnabled = false;

    try {
      await this.onDeactivate();
      this[Disposers]();
      this.dependencies.logger.info(`[EXTENSION]: disabled ${this.name}@${this.version}`);
    } catch (error) {
      this.dependencies.logger.error(`[EXTENSION]: disabling ${this.name}@${this.version} threw an error: ${error}`);
    }
  }

  async activate(): Promise<void> {
    return this.onActivate();
  }

  protected onActivate(): Promise<void> | void {
    return;
  }

  protected onDeactivate(): Promise<void> | void {
    return;
  }
}

export function sanitizeExtensionName(name: string) {
  return name.replace("@", "").replace("/", "--");
}

export function getSanitizedPath(...parts: string[]) {
  return parts
    .filter(Boolean)
    .join("/")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "");
} // normalize multi-slashes (e.g. coming from page.id)

export function extensionDisplayName(name: string, version: string) {
  return `${name}@${version}`;
}
