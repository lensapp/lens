import { BaseStore } from "../common/base-store"
import * as path from "path"
import { LensExtension } from "./lens-extension"

export abstract class ExtensionStore<T> extends BaseStore<T> {
  protected extension: LensExtension

  async loadExtension(extension: LensExtension) {
    this.extension = extension
    return super.load()
  }

  async load() {
    if (!this.extension) { return }
    return super.load()
  }

  protected cwd() {
    return path.join(super.cwd(), "extension-store", this.extension.name)
  }
}
