import type { ExtensionModel } from "./extension-store";
import type { LensRuntimeRendererEnv } from "./lens-runtime";
import type { PageRegistration } from "./register-page";
import { readJsonSync } from "fs-extra";
import { action, observable, toJS } from "mobx";
import extensionManifest from "./example-extension/package.json"
import logger from "../main/logger";

export type ExtensionId = string | ExtensionPackageJsonPath;
export type ExtensionPackageJsonPath = string;
export type ExtensionVersion = string | number;
export type ExtensionManifest = typeof extensionManifest & ExtensionModel;

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
  @observable.ref runtime: LensRuntimeRendererEnv;

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
    this.onActivate();
  }

  async disable() {
    this.onDeactivate();
    this.isEnabled = false;
    this.runtime = null;
    this.disposers.forEach(cleanUp => cleanUp());
    this.disposers.length = 0;
    console.log(`[EXTENSION]: disabled ${this.name}@${this.version}`, this.getMeta());
  }

  // todo: add more hooks
  protected onActivate() {
    // mock
  }

  protected onDeactivate() {
    // mock
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

  // Runtime helpers
  protected registerPage(params: PageRegistration, autoDisable = true) {
    const dispose = this.runtime.dynamicPages.register(params);
    if (autoDisable) {
      this.disposers.push(dispose);
    }
  }
}
