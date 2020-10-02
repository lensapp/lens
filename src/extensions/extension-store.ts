import type { ExtensionId, ExtensionManifest, ExtensionVersion, LensExtension } from "./lens-extension";
import { observable, toJS, } from "mobx";
import { BaseStore } from "../common/base-store";

export interface ExtensionStoreModel {
  extensions: [ExtensionId, ExtensionModel][]
}

export interface ExtensionModel {
  id: ExtensionId;
  version: ExtensionVersion;
  name: string;
  manifestPath: string;
  description?: string;
  enabled?: boolean;
  updateUrl?: string;
}

export interface InstalledExtension<T extends ExtensionModel = any> {
  manifestPath: string;
  manifest: ExtensionManifest;
  extensionModule: {
    [name: string]: any;
    default: new (model: ExtensionModel, manifest?: ExtensionManifest) => LensExtension
  }
}

export class ExtensionStore extends BaseStore<ExtensionStoreModel> {
  private constructor() {
    super({
      configName: "lens-extension-store",
    });
  }

  @observable extensions = observable.map<ExtensionId, LensExtension>();

  getById(id: ExtensionId): LensExtension {
    return this.extensions.get(id);
  }

  async removeById(id: ExtensionId) {
    const extension = this.getById(id);
    if (extension) {
      await extension.uninstall();
      this.extensions.delete(id);
    }
  }

  toJSON(): ExtensionStoreModel {
    return toJS({
      extensions: Array.from(this.extensions).map(([id, instance]) => [id, instance.toJSON()]),
    }, {
      recurseEverything: true,
    })
  }
}

export const extensionStore = ExtensionStore.getInstance<ExtensionStore>()
