import type { ExtensionModel } from "./extension-store";
import type { LensRuntimeRendererEnv } from "./lens-runtime";
import { readJsonSync } from "fs-extra";
import { action, observable, toJS } from "mobx";
import extensionManifest from "./example-extension/package.json"
import logger from "../main/logger";

export type ExtensionId = string; // instance-id or abs path to "%lens-extension/manifest.json"
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
  @observable.ref runtime: Partial<LensRuntimeRendererEnv> = {};

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

  async enable(runtime: LensRuntimeRendererEnv) {
    this.isEnabled = true;
    this.runtime = runtime;
    console.log(`[EXTENSION]: enabled ${this.name}@${this.version}`, this.getMeta());
  }

  async disable() {
    this.isEnabled = false;
    this.runtime = {};
    console.log(`[EXTENSION]: disabled ${this.name}@${this.version}`, this.getMeta());
  }

  // todo
  async install(downloadUrl?: string) {
    return;
  }

  // todo
  async uninstall() {
    return;
  }

  async hasNewVersion(): Promise<Partial<ExtensionModel>> {
    return;
  }

  getMeta() {
    return toJS({
      id: this.id,
      manifest: this.manifest,
      manifestPath: this.manifestPath,
      enabled: this.isEnabled,
      runtime: this.runtime,
    }, {
      recurseEverything: true
    })
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
