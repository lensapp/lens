import type { ExtensionModel } from "./extension-store";
import { readJsonSync } from "fs-extra";
import { action, observable, when } from "mobx";
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
  @observable isReady = false;
  @observable isEnabled = false;

  whenReady = when(() => this.isReady);

  constructor(model: ExtensionModel, manifest?: ExtensionManifest) {
    this.importModel(model, manifest);
  }

  @action
  async importModel({ enabled, manifestPath, ...model }: ExtensionModel, manifest?: ExtensionManifest) {
    try {
      this.manifest = manifest || await readJsonSync(manifestPath, { throws: true })
      this.manifestPath = manifestPath;
      this.isEnabled = enabled;
      Object.assign(this, model);
      this.isReady = true;
    } catch (err) {
      logger.error(`[EXTENSION]: cannot read manifest at ${manifestPath}`, { ...model, err: String(err) })
      this.disable();
    }
  }

  async init() {
    // todo: add more app/extension lifecycle hooks? e.g. onAppExit(), etc.
    // todo: provide runtime dependencies
  }

  async install() {
    // todo
  }

  async uninstall() {
    // todo
  }

  async checkNewVersion() {
    // todo
  }

  async enable() {
    this.isEnabled = true;
    // todo
  }

  async disable() {
    this.isEnabled = false;
    // todo
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
