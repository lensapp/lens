import type { LensExtension, LensExtensionConstructor, LensExtensionId, LensExtensionManifest, LensExtensionStoreModel } from "./lens-extension"
import type { LensMainExtension } from "./lens-main-extension"
import type { LensRendererExtension } from "./lens-renderer-extension"
import path from "path"
import { broadcastIpc } from "../common/ipc"
import { action, autorun, computed, observable, reaction, toJS } from "mobx"
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
  protected disposers = new Map<LensExtensionId, Function[]>();

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
      this.handleActivation(extension, () => [
        registries.menuRegistry.add(...extension.appMenus)
      ])
    })
  }

  loadOnClusterManagerRenderer() {
    logger.info('[EXTENSIONS-LOADER]: load on main renderer (cluster manager)')
    this.autoInitExtensions();
    this.autoEnableExtensions((extension: LensRendererExtension) => {
      this.handleActivation(extension, () => [
        registries.globalPageRegistry.add(...extension.globalPages),
        registries.appPreferenceRegistry.add(...extension.appPreferences),
        registries.clusterFeatureRegistry.add(...extension.clusterFeatures),
        registries.statusBarRegistry.add(...extension.statusBarItems),
      ])
    })
  }

  loadOnClusterRenderer() {
    logger.info('[EXTENSIONS-LOADER]: load on cluster renderer (dashboard)')
    this.autoInitExtensions();
    this.autoEnableExtensions((extension: LensRendererExtension) => {
      this.handleActivation(extension, () => [
        registries.clusterPageRegistry.add(...extension.clusterPages),
        registries.kubeObjectMenuRegistry.add(...extension.kubeObjectMenuItems),
        registries.kubeObjectDetailRegistry.add(...extension.kubeObjectDetailItems),
      ])
    })
  }

  protected isEnabledInStore(ext: LensExtension) {
    const extensionState = this.state.get(ext.id);
    return !extensionState /*enabled by default*/ || extensionState.isEnabled;
  }

  protected handleActivation(ext: LensExtension, addToRegistry: () => Function[]) {
    const enabledInStore = this.isEnabledInStore(ext);
    if (enabledInStore) {
      this.disposers.set(ext.id, addToRegistry())
    } else {
      this.disposers.get(ext.id)?.forEach(dispose => dispose())
      this.disposers.delete(ext.id)
    }
  }

  protected autoEnableExtensions(callback: (ext: LensExtension) => void) {
    return autorun(() => {
      this.instances.forEach(ext => {
        const isEnabled = this.isEnabledInStore(ext);
        ext.toggle(isEnabled);
        callback(ext);
      })
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
