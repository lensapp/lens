import { observable } from "mobx";
import { ExtensionModel } from "./extension-store";

// TODO: extensions api
// * Lazy load/unload extension (js/ts?) (from sources: local folder, npm_modules/@lens/some_plugin, etc.)
// * figure out how to expose lens external apis to extension:
// - opt1: import {someApi} from "@lens" => replaced to import from "$PATH/build/Lens.js" on the fly ?
// - opt2: eval with injected exposed apis / contents.executeJavaScript / script[src] / etc. ?

export type ExtensionId = string;
export type ExtensionVersion = string | number;

export class LensExtension implements ExtensionModel {
  public id: ExtensionId;
  public version: string | number;
  public updateUrl: string;

  @observable name = "";
  @observable description = "";
  @observable isEnabled = false;
  @observable isInstalled = false;

  constructor(model: ExtensionModel) {
    this.importModel(model);
  }

  importModel({ enabled, ...model }: ExtensionModel) {
    Object.assign(this, model);
    this.isEnabled = enabled;
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
    // todo
  }

  async disable() {
    // todo
  }
}
