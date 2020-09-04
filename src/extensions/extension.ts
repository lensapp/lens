import type { ExtensionModel } from "./extension-store";
import type { LensRendererRuntimeEnv } from "./extension-api.runtime";
import { readJsonSync } from "fs-extra";
import { action, observable } from "mobx";
import extensionManifest from "./example-extension/package.json"
import logger from "../main/logger";

export type ExtensionId = string;
export type ExtensionVersion = string | number;
export type ExtensionManifest = typeof extensionManifest & ExtensionModel;

export class LensExtension implements ExtensionModel {
  public id: ExtensionId;
  public updateUrl: string;

  @observable name = "";
  @observable description = "";
  @observable version: ExtensionVersion = "0.0.0";
  @observable manifest: ExtensionManifest;
  @observable manifestPath: string;
  @observable isEnabled = false;
  @observable.ref runtime: LensRendererRuntimeEnv;

  constructor(model: ExtensionModel, manifest: ExtensionManifest) {
    this.importModel(model, manifest);
  }

  @action
  async importModel({ enabled, manifestPath, ...model }: ExtensionModel, manifest?: ExtensionManifest) {
    try {
      this.manifest = manifest || await readJsonSync(manifestPath, { throws: true })
      this.manifestPath = manifestPath;
      this.isEnabled = enabled;
      Object.assign(this, model);
    } catch (err) {
      logger.error(`[EXTENSION]: cannot read manifest at ${manifestPath}`, { ...model, err: String(err) })
      this.disable();
    }
  }

  async activate(params: LensRendererRuntimeEnv) {
    logger.info(`[EXTENSION]: activate ${this.name}@${this.version}`, this.getMeta());
    this.runtime = params;
  }

  async deactivate() {
    logger.info(`[EXTENSION]: deactivate ${this.name}@${this.version}`, this.getMeta());
    this.runtime = null;
  }

  async enable() {
    logger.info(`[EXTENSION]: enable ${this.name}@${this.version}`, this.getMeta());
    this.isEnabled = true;
  }

  async disable() {
    logger.info(`[EXTENSION]: disable ${this.name}@${this.version}`, this.getMeta());
    this.isEnabled = false;
  }

  async install() {
    // todo
  }

  async uninstall() {
    // todo
  }

  async upgrade() {
    // todo
  }

  async checkNewVersion() {
    // todo
  }

  getMeta() {
    return {
      id: this.id,
      manifest: this.manifest,
      manifestPath: this.manifestPath,
      enabled: this.isEnabled,
    }
  }

  toJSON(): ExtensionModel {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      manifestPath: this.manifestPath,
      enabled: this.isEnabled,
      updateUrl: this.updateUrl,
    }
  }
}
