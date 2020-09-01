import path from "path";
import fs from "fs-extra";
import { action, comparer, observable, toJS } from "mobx";
import { BaseStore } from "../common/base-store";
import { ExtensionId, ExtensionVersion, LensExtension } from "./extension";
import { isDevelopment } from "../common/vars";
import logger from "../main/logger";

export interface ExtensionStoreModel {
  version: ExtensionVersion;
  extensions: Record<ExtensionId, ExtensionModel>
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

export class ExtensionStore extends BaseStore<ExtensionStoreModel> {
  private constructor() {
    super({
      configName: "lens-extension-store",
    });
  }

  @observable version: ExtensionVersion = "0.0.0";
  @observable extensions = observable.map<ExtensionId, LensExtension>();
  @observable removed = observable.map<ExtensionId, LensExtension>();
  @observable installed = observable.set<LensExtension>([], { equals: comparer.shallow });

  async load() {
    await this.loadExtensions();
    return super.load();
  }

  async loadExtensions() {
    const localExtensions = await fs.readdir(this.builtInExtensionsPath);
    logger.info(`[EXTENSIONS]: scanning installed extensions`, { paths: localExtensions });
    this.installed.replace(localExtensions as any[]);
    // return localExtensions
    // .filter(path => ![".", ".."].includes(path))
    // .map(path => import(`${path}/package.json`));
  }

  get builtInExtensionsPath(): string {
    if (isDevelopment) {
      return path.resolve(__static, "../src/extensions");
    }
    return "" // todo: figure out prod-path
  }

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

  @action
  protected fromStore({ extensions, version }: ExtensionStoreModel) {
    if (version) {
      this.version = version;
    }
    if (extensions) {
      const currentExtensions = new Map(Object.entries(extensions));
      this.extensions.forEach(extension => {
        if (!currentExtensions.has(extension.id)) {
          this.removed.set(extension.id, extension);
        }
      })
      currentExtensions.forEach(model => {
        const extension = this.getById(model.id)
        if (!extension) {
          this.extensions.set(model.id, new LensExtension(model));
        } else {
          extension.importModel(model);
        }
      })
    }
  }

  toJSON(): ExtensionStoreModel {
    return toJS({
      version: this.version,
      extensions: this.extensions.toJSON(),
    }, {
      recurseEverything: true,
    })
  }
}

export const extensionStore = ExtensionStore.getInstance<ExtensionStore>()
