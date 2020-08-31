import { observable } from "mobx";
import { ExtensionModel } from "./extension-store";

export type ExtensionId = string;
export type ExtensionVersion = string | number;

export class LensExtension implements ExtensionModel {
  public id: ExtensionId;
  public version: string | number;

  @observable name = "";
  @observable description = "";
  @observable isEnabled = false;

  constructor(model: ExtensionModel) {
    this.importModel(model);
  }

  importModel(model: ExtensionModel) {
    Object.assign(this, model);
  }

  async install() {
    // todo
  }

  async uninstall() {
    // todo
  }

  async enable() {
    // todo
  }

  async disable() {
    // todo
  }
}
