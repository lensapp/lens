/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import { disposer } from "../common/utils";
import type { ProtocolHandlerRegistration } from "../common/protocol-handler/registration";
import assert from "assert";
import type { BundledInstalledExtension, ExternalInstalledExtension, InstalledExtension, LensExtensionManifest } from "../features/extensions/common/installed-extension";
import type { FileSystemProvisionerStore } from "./extension-loader/file-system-provisioner-store/file-system-provisioner-store";
import type { Logger } from "../common/logger";

export type LensExtensionConstructor = new (ext: ExternalInstalledExtension) => LensExtension;
export type BundledLensExtensionContructor = new (ext: BundledInstalledExtension) => LensExtension;

export interface LensExtensionDependencies {
  readonly fileSystemProvisionerStore: FileSystemProvisionerStore;
  readonly logger: Logger;
}

export const Disposers = Symbol("disposers");

export class LensExtension {
  get id() {
    return this.extension.id;
  }

  get manifest() {
    return this.extension.manifest as LensExtensionManifest;
  }

  get manifestPath() {
    assert(!this.extension.isBundled, "LensExtension.manifestPath doesn't exist for bundled extensions");

    return this.extension.manifestPath;
  }

  get isBundled() {
    return this.extension.isBundled;
  }

  get sanitizedExtensionId() {
    return sanitizeExtensionName(this.name);
  }

  protocolHandlers: ProtocolHandlerRegistration[] = [];

  private readonly _isEnabled = observable.box(false);

  get isEnabled() {
    return this._isEnabled.get();
  }

  /**
   * @ignore
   */
  [Disposers] = disposer();

  /**
   * @ignore
   */
  declare protected readonly dependencies: LensExtensionDependencies;

  constructor(deps: LensExtensionDependencies, private readonly extension: InstalledExtension) {
    this.dependencies = deps;
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

  async enable() {
    if (this._isEnabled.get()) {
      return;
    }

    this._isEnabled.set(true);
    this.dependencies.logger.info(`[EXTENSION]: enabled ${this.name}@${this.version}`);
  }

  async disable() {
    if (!this._isEnabled.get()) {
      return;
    }

    this._isEnabled.set(false);

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
