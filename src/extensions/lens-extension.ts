import { observable, toJS } from "mobx";
import logger from "../main/logger";
import { BaseRegistry } from "./registries/base-registry";
import type { InstalledExtension } from "./extension-loader";

export type LensExtensionConstructor = new (init: InstalledExtension) => LensExtension;

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
  protected disposers: (() => void)[] = [];

  @observable isEnabled = false;

  constructor({ manifest, manifestPath, isBundled }: InstalledExtension) {
    this.manifest = manifest
    this.manifestPath = manifestPath
    this.isBundled = !!isBundled
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

  async enable() {
    this.isEnabled = true;
    logger.info(`[EXTENSION]: enabled ${this.name}@${this.version}`);
    this.onActivate();
  }

  async disable() {
    this.onDeactivate();
    this.isEnabled = false;
    this.disposers.forEach(cleanUp => cleanUp());
    this.disposers.length = 0;
    logger.info(`[EXTENSION]: disabled ${this.name}@${this.version}`);
  }

  protected onActivate() {
    // mock
  }

  protected onDeactivate() {
    // mock
  }

  registerTo<T = any>(registry: BaseRegistry<T>, items: T[] = []) {
    const disposers = items.map(item => registry.add(item));
    this.disposers.push(...disposers);
    return () => {
      this.disposers = this.disposers.filter(disposer => !disposers.includes(disposer))
    };
  }

  toJSON() {
    return toJS({
      name: this.name,
      version: this.version,
      description: this.description,
      manifestPath: this.manifestPath,
      isEnabled: this.isEnabled,
    }, {
      recurseEverything: true,
    })
  }
}
