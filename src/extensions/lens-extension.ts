import type { LensExtensionRuntimeEnv } from "./lens-runtime";
import { readJsonSync } from "fs-extra";
import { action, observable, toJS } from "mobx";
import logger from "../main/logger";

export type ExtensionId = string | ExtensionPackageJsonPath;
export type ExtensionPackageJsonPath = string;
export type ExtensionVersion = string | number;

export interface ExtensionModel {
  id: ExtensionId;
  version: ExtensionVersion;
  name: string;
  manifestPath: string;
  description?: string;
  enabled?: boolean;
  updateUrl?: string;
}

export interface ExtensionManifest extends ExtensionModel {
  main?: string;
  renderer?: string;
  description?: string; // todo: add more fields similar to package.json + some extra
}

export class LensExtension implements ExtensionModel {
  public id: ExtensionId;
  public updateUrl: string;
  protected disposers: Function[] = [];

  @observable name = "";
  @observable description = "";
  @observable version: ExtensionVersion = "0.0.0";
  @observable manifest: ExtensionManifest;
  @observable manifestPath: string;
  @observable isEnabled = false;
  @observable.ref runtime: LensExtensionRuntimeEnv;

  constructor(model: ExtensionModel, manifest: ExtensionManifest) {
    this.importModel(model, manifest);
  }

  @action
  async importModel({ enabled, manifestPath, ...model }: ExtensionModel, manifest?: ExtensionManifest) {
    try {
      this.manifest = manifest || await readJsonSync(manifestPath, { throws: true })
      this.manifestPath = manifestPath;
      Object.assign(this, model);
    } catch (err) {
      logger.error(`[EXTENSION]: cannot read manifest at ${manifestPath}`, { ...model, err: String(err) })
      this.disable();
    }
  }

  async migrate(appVersion: string) {
    // mock
  }

  async enable(runtime: LensExtensionRuntimeEnv) {
    this.isEnabled = true;
    this.runtime = runtime;
    logger.info(`[EXTENSION]: enabled ${this.name}@${this.version}`, this.getMeta());
    this.onActivate();
  }

  async disable() {
    this.onDeactivate();
    this.isEnabled = false;
    this.runtime = null;
    this.disposers.forEach(cleanUp => cleanUp());
    this.disposers.length = 0;
    logger.info(`[EXTENSION]: disabled ${this.name}@${this.version}`, this.getMeta());
  }

  // todo: add more hooks
  protected onActivate() {
    // mock
  }

  protected onDeactivate() {
    // mock
  }

  getMeta() {
    return toJS({
      id: this.id,
      manifest: this.manifest,
      manifestPath: this.manifestPath,
      enabled: this.isEnabled
    }, {
      recurseEverything: true
    })
  }

  toJSON(): ExtensionModel {
    return toJS({
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      manifestPath: this.manifestPath,
      enabled: this.isEnabled,
      updateUrl: this.updateUrl,
    }, {
      recurseEverything: true,
    })
  }
}
