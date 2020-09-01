import path from "path";
import fs from "fs-extra";
import { action, comparer, observable, toJS } from "mobx";
import { BaseStore } from "../common/base-store";
import { ExtensionId, ExtensionManifest, ExtensionVersion, LensExtension } from "./extension";
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
  @observable installed = observable.set<ExtensionManifest>([], { equals: comparer.shallow });

  get folderPath(): string {
    if (isDevelopment) {
      return path.resolve(__static, "../src/extensions");
    }
    return "" // todo: figure out prod-path
  }

  async load() {
    await this.loadInstalledExtensions();
    return super.load();
  }

  async loadInstalledExtensions() {
    const extensions = await this.loadExtensions(this.folderPath);
    this.installed.replace(extensions);
  }

  async loadExtensions(basePath: string): Promise<ExtensionManifest[]> {
    const paths = await fs.readdir(basePath);
    const extensionsStats = paths.map(fileName => {
      const absPath = path.resolve(basePath, fileName);
      const manifestPath = path.resolve(absPath, "manifest.json");
      return fs.stat(manifestPath).then(async stat => {
        if (stat.isFile()) {
          const manifestJson = await fs.readJson(manifestPath);
          const manifest: ExtensionManifest = {
            ...manifestJson,
            manifestPath: manifestPath,
          }
          return manifest;
        }
      })
    });
    let extensions = await Promise.all(extensionsStats.map(extStat => extStat.catch(() => null)));
    extensions = extensions.filter(v => !!v); // filter out files and invalid folders (without manifest.json)
    logger.info(`[EXTENSION-STORE]: loaded ${extensions.length} extensions`, { basePath, extensions });
    return extensions;
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
