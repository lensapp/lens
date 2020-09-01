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

export interface InstalledExtension<T extends ExtensionModel = any> {
  manifestPath: string;
  manifest: ExtensionManifest;
  LensExtension: new (model: T, manifest?: ExtensionManifest) => LensExtension;
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
  @observable installed = observable.map<string, InstalledExtension>([], { equals: comparer.shallow });

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

  getExtensionByManifest(manifestPath: string): InstalledExtension {
    let manifestJson: ExtensionManifest;
    let mainJs: string;
    try {
      manifestJson = __non_webpack_require__(manifestPath); // eslint-disable-line
      mainJs = path.resolve(path.dirname(manifestPath), manifestJson.main); // fixme: compile *.ts on the fly
      const LensExtension = __non_webpack_require__(mainJs).default; // eslint-disable-line
      return {
        manifestPath: manifestPath,
        manifest: manifestJson,
        LensExtension: LensExtension,
      }
    } catch (err) {
      logger.error(`[EXTENSION-STORE]: can't load extension at ${manifestPath}: ${err}`, { manifestJson, mainJs });
    }
  }

  @action
  async loadInstalledExtensions() {
    const extensions = await this.loadExtensions(this.folderPath);
    this.installed.replace(extensions.map(ext => [ext.manifestPath, ext]));
  }

  async loadExtensions(folderPath: string): Promise<InstalledExtension[]> {
    const paths = await fs.readdir(folderPath);
    const manifestsLoading = paths.map(fileName => {
      const absPath = path.resolve(folderPath, fileName);
      const manifestPath = path.resolve(absPath, "package.json");
      return fs.access(manifestPath, fs.constants.F_OK)
        .then(() => this.getExtensionByManifest(manifestPath))
        .catch(() => null)
    });
    let extensions = await Promise.all(manifestsLoading);
    extensions = extensions.filter(v => !!v); // filter out files and invalid folders (without manifest.json)
    logger.info(`[EXTENSION-STORE]: ${extensions.length} extensions loaded`, { folderPath, extensions });
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
        const manifest = this.installed.get(model.manifestPath);
        if (!manifest) {
          logger.error(`[EXTENSION-STORE]: can't load extension manifest at ${model.manifestPath}`, { model })
          return;
        }
        const extension = this.getById(model.id)
        if (!extension) {
          try {
            const { LensExtension, manifest: manifestJson } = manifest;
            this.extensions.set(model.id, new LensExtension(model, manifestJson));
          } catch (err) {
            logger.error(`[EXTENSION-STORE]: init extension failed: ${err}`, { model, manifest })
          }
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
