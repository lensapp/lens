import { action, observable, toJS } from "mobx";
import logger from "../main/logger";
import type { InstalledExtension } from "./extension-loader";

export type LensExtensionId = string; // path to manifest (package.json)
export type LensExtensionConstructor = new (init: InstalledExtension) => LensExtension;

export interface LensExtensionStoreModel {
  id: LensExtensionId;
  name: string;
  isEnabled?: boolean;
}

export interface LensExtensionManifest {
  name: string;
  version: string;
  description?: string;
  main?: string; // path to %ext/dist/main.js
  renderer?: string; // path to %ext/dist/renderer.js
}

export class LensExtension {
  public manifest: LensExtensionManifest;
  public manifestPath: string;
  public isBundled: boolean;

  @observable isEnabled = false;

  constructor({ manifest, manifestPath, isBundled }: InstalledExtension) {
    this.manifest = manifest
    this.manifestPath = manifestPath
    this.isBundled = !!isBundled
  }

  get id(): LensExtensionId {
    return this.manifestPath;
  }

  get name() {
    return this.manifest.name
  }

  get version() {
    return this.manifest.version
  }

  get description() {
    return this.manifest.description
  }

  @action
  async enable() {
    if (this.isEnabled) return;
    this.isEnabled = true;
    this.onActivate();
    logger.info(`[EXTENSION]: enabled ${this.name}@${this.version}`);
  }

  @action
  async disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.onDeactivate();
    logger.info(`[EXTENSION]: disabled ${this.name}@${this.version}`);
  }

  toggle(enable?: boolean) {
    if (typeof enable === "boolean") {
      enable ? this.enable() : this.disable()
    } else {
      this.isEnabled ? this.disable() : this.enable()
    }
  }

  protected onActivate() {
    // mock
  }

  protected onDeactivate() {
    // mock
  }

  toJSON(): LensExtensionStoreModel {
    return toJS({
      id: this.id,
      name: this.name,
      isEnabled: this.isEnabled,
    }, {
      recurseEverything: true,
    })
  }
}
