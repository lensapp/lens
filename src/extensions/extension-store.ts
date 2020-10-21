import { BaseStore } from "../common/base-store"
import * as path from "path"
import { LensExtension } from "./lens-extension"

export class ExtensionStore<T = any> extends BaseStore<T> {
  protected extension: LensExtension

  async loadExtension(extension: LensExtension) {
    this.extension = extension
    await super.load()
  }

  async load() {
    if (!this.extension) { return }
    await super.load()
  }

  protected storePath() {
    return path.join(super.storePath(), "extension-store", this.extension.name)
  }
}
