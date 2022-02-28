/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { InstalledExtension } from "./extension-discovery/extension-discovery";
import { action, observable, makeObservable, computed } from "mobx";
import logger from "../main/logger";
import type { ProtocolHandlerRegistration } from "./registries";
import type { PackageJson } from "type-fest";
import { Disposer, disposer } from "../common/utils";
import {
  LensExtensionDependencies,
  setLensExtensionDependencies,
} from "./lens-extension-set-dependencies";

/**
 * A named type for when functions should expect an extension's ID
 */
export type LensExtensionId = string;
export type LensExtensionConstructor = new (...args: ConstructorParameters<typeof LensExtension>) => LensExtension;

/**
 * The required fields that an extension's `package.json` must include
 */
export interface LensExtensionManifest extends PackageJson {
  /**
   * The name of the extension
   */
  name: string;

  /**
   * The SemVer version string
   */
  version: string;

  /**
   * The path to compiled JS file for the main side of the extension.
   */
  main?: string;

  /**
   * The path to compiled JS file for the renderer side of the extension.
   */
  renderer?: string;
}

/**
 * @internal
 */
export const Disposers = Symbol();

/**
 * The base class for all extensions.
 */
export class LensExtension {
  readonly id: LensExtensionId;
  readonly manifest: LensExtensionManifest;
  readonly manifestPath: string;
  readonly isBundled: boolean;

  protocolHandlers: ProtocolHandlerRegistration[] = [];

  @observable private _isEnabled = false;

  @computed get isEnabled() {
    return this._isEnabled;
  }

  /**
   * @internal
   */
  [Disposers] = disposer();

  constructor({ id, manifest, manifestPath, isBundled }: InstalledExtension) {
    makeObservable(this);
    this.id = id;
    this.manifest = manifest;
    this.manifestPath = manifestPath;
    this.isBundled = !!isBundled;
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

  private dependencies: LensExtensionDependencies;

  /**
   * @internal
   */
  [setLensExtensionDependencies] = (dependencies: LensExtensionDependencies) => {
    this.dependencies = dependencies;
  };

  /**
   * getExtensionFileFolder returns the path to an already created folder. This
   * folder is for the sole use of this extension.
   *
   * Note: there is no security done on this folder, only obfuscation of the
   * folder name.
   */
  async getExtensionFileFolder(): Promise<string> {
    return this.dependencies.fileSystemProvisionerStore.requestDirectory(this.id);
  }

  @action
  async enable(register: (ext: LensExtension) => Promise<Disposer[]>) {
    if (this._isEnabled) {
      return;
    }

    try {
      this._isEnabled = true;

      this[Disposers].push(...await register(this));
      logger.info(`[EXTENSION]: enabled ${this.name}@${this.version}`);
    } catch (error) {
      logger.error(`[EXTENSION]: failed to activate ${this.name}@${this.version}: ${error}`);
    }
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
      logger.info(`[EXTENSION]: disabled ${this.name}@${this.version}`);
    } catch (error) {
      logger.error(`[EXTENSION]: disabling ${this.name}@${this.version} threw an error: ${error}`);
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

export function extensionDisplayName(name: string, version: string) {
  return `${name}@${version}`;
}
