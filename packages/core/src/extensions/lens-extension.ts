/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, makeObservable, observable } from "mobx";
import { disposer } from "@k8slens/utilities";
import type { ProtocolHandlerRegistration } from "../common/protocol-handler/registration";
import type { InstalledExtension, LensExtensionId, LensExtensionManifest } from "@k8slens/legacy-extensions";
import type { Logger } from "./common-api";
import type { EnsureHashedDirectoryForExtension } from "./extension-loader/file-system-provisioner-store/ensure-hashed-directory-for-extension.injectable";

export const Disposers = Symbol("disposers");

export interface LensExtensionDependencies {
  readonly logger: Logger;
  ensureHashedDirectoryForExtension: EnsureHashedDirectoryForExtension;
}

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
    return this.dependencies.ensureHashedDirectoryForExtension(this.storeName);
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
