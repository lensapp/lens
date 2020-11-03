import type { LensExtension, LensExtensionConstructor, LensExtensionId, LensExtensionManifest, LensExtensionStoreModel } from "./lens-extension"
import type { LensMainExtension } from "./lens-main-extension"
import type { LensRendererExtension } from "./lens-renderer-extension"
import path from "path"
import { broadcastIpc } from "../common/ipc"
import { action, computed, observable, reaction, toJS } from "mobx"
import logger from "../main/logger"
import { app, ipcRenderer, remote } from "electron"
import { BaseStore } from "../common/base-store";
import * as registries from "./registries";

export interface ExtensionLoaderStoreModel {
  extensions: LensExtensionStoreModel[]
}

export interface InstalledExtension {
  manifest: LensExtensionManifest;
  manifestPath: string;
  isBundled?: boolean; // defined in package.json
}

// lazy load so that we get correct userData
export function extensionPackagesRoot() {
  return path.join((app || remote.app).getPath("userData"))
}

export class ExtensionLoader extends BaseStore<ExtensionLoaderStoreModel> {
  @observable extensions = observable.map<LensExtensionId, InstalledExtension>([], { deep: false });
  @observable instances = observable.map<LensExtensionId, LensExtension>([], { deep: false })
  @observable state = observable.map<LensExtensionId, LensExtensionStoreModel>();

  constructor() {
    super({
      configName: "lens-extensions",
    });
    if (ipcRenderer) {
      ipcRenderer.on("extensions:loaded", (event, extensions: InstalledExtension[]) => {
        extensions.forEach((ext) => {
          if (!this.extensions.has(ext.manifestPath)) {
            this.extensions.set(ext.manifestPath, ext)
          }
        })
      });
    }
  }

  @computed get userExtensions(): LensExtension[] {
    return [...this.instances.values()].filter(ext => !ext.isBundled)
  }

  loadOnMain() {
    logger.info('[EXTENSIONS-LOADER]: load on main')
    this.autoInitExtensions();
    this.autoEnableExtensions((extension: LensMainExtension) => {
      extension.registerTo(registries.menuRegistry, extension.appMenus)
    })
  }

  loadOnClusterManagerRenderer() {
    logger.info('[EXTENSIONS-LOADER]: load on main renderer (cluster manager)')
    this.autoInitExtensions();
    this.autoEnableExtensions((extension: LensRendererExtension) => {
      extension.registerTo(registries.globalPageRegistry, extension.globalPages)
      extension.registerTo(registries.appPreferenceRegistry, extension.appPreferences)
      extension.registerTo(registries.clusterFeatureRegistry, extension.clusterFeatures)
      extension.registerTo(registries.statusBarRegistry, extension.statusBarItems)
    })
  }

  loadOnClusterRenderer() {
    logger.info('[EXTENSIONS-LOADER]: load on cluster renderer (dashboard)')
    this.autoInitExtensions();
    this.autoEnableExtensions((extension: LensRendererExtension) => {
      extension.registerTo(registries.clusterPageRegistry, extension.clusterPages)
      extension.registerTo(registries.kubeObjectMenuRegistry, extension.kubeObjectMenuItems)
      extension.registerTo(registries.kubeObjectDetailRegistry, extension.kubeObjectDetailItems)
    })
  }

  protected autoEnableExtensions(callback: (ext: LensExtension) => void) {
    return reaction(() => this.instances.toJS(), instances => {
      instances.forEach(ext => {
        const extensionState = this.state.get(ext.id);
        const enabledInStore = !extensionState /*enabled by default*/ || extensionState.isEnabled;
        if (!ext.isEnabled && enabledInStore) {
          ext.enable();
          callback(ext);
        } else if (ext.isEnabled && !enabledInStore) {
          ext.disable();
        }
      })
    }, {
      fireImmediately: true,
    })
  }

  protected autoInitExtensions() {
    return reaction(() => this.extensions.toJS(), (installedExtensions) => {
      for (const [id, ext] of installedExtensions) {
        let instance = this.instances.get(ext.manifestPath)
        if (!instance) {
          const extensionModule = this.requireExtension(ext)
          if (!extensionModule) {
            continue
          }
          try {
            const LensExtensionClass: LensExtensionConstructor = extensionModule.default;
            instance = new LensExtensionClass(ext);
            this.instances.set(ext.manifestPath, instance);
          } catch (err) {
            logger.error(`[EXTENSIONS-LOADER]: init extension instance error`, { ext, err })
          }
        }
      }
    }, {
      fireImmediately: true,
    })
  }

  protected requireExtension(extension: InstalledExtension) {
    let extEntrypoint = ""
    try {
      if (ipcRenderer && extension.manifest.renderer) {
        extEntrypoint = path.resolve(path.join(path.dirname(extension.manifestPath), extension.manifest.renderer))
      } else if (!ipcRenderer && extension.manifest.main) {
        extEntrypoint = path.resolve(path.join(path.dirname(extension.manifestPath), extension.manifest.main))
      }
      if (extEntrypoint !== "") {
        return __non_webpack_require__(extEntrypoint)
      }
    } catch (err) {
      console.error(`[EXTENSION-LOADER]: can't load extension main at ${extEntrypoint}: ${err}`, { extension });
      console.trace(err)
    }
  }

  broadcastExtensions(frameId?: number) {
    broadcastIpc({
      channel: "extensions:loaded",
      frameId: frameId,
      frameOnly: !!frameId,
      args: [
        Array.from(this.extensions.toJS().values())
      ],
    })
  }

  @action
  protected fromStore({ extensions = [] }: ExtensionLoaderStoreModel) {
    extensions.forEach(ext => {
      this.state.set(ext.id, ext);
    })
  }

  toJSON(): ExtensionLoaderStoreModel {
    return toJS({
      extensions: this.userExtensions.map(ext => ext.toJSON())
    }, {
      recurseEverything: true,
    })
  }
}

export const extensionLoader: ExtensionLoader = ExtensionLoader.getInstance();
