import type { ExtensionId, ExtensionManifest, ExtensionModel, LensExtension } from "./lens-extension"
import type { LensMainExtension } from "./lens-main-extension"
import type { LensRendererExtension } from "./lens-renderer-extension"
import path from "path"
import { broadcastIpc } from "../common/ipc"
import { observable, reaction, toJS, } from "mobx"
import logger from "../main/logger"
import { app, ipcRenderer, remote } from "electron"
import { appPreferenceRegistry, clusterFeatureRegistry, clusterPageRegistry, globalPageRegistry, kubeObjectMenuRegistry, menuRegistry, statusBarRegistry } from "./registries";

export interface InstalledExtension extends ExtensionModel {
  manifestPath: string;
  manifest: ExtensionManifest;
}

// lazy load so that we get correct userData
export function extensionPackagesRoot() {
  return path.join((app || remote.app).getPath("userData"))
}

export class ExtensionLoader {
  @observable extensions = observable.map<ExtensionId, InstalledExtension>([], { deep: false });
  @observable instances = observable.map<ExtensionId, LensExtension>([], { deep: false })

  constructor() {
    if (ipcRenderer) {
      ipcRenderer.on("extensions:loaded", (event, extensions: InstalledExtension[]) => {
        extensions.forEach((ext) => {
          if (!this.getById(ext.manifestPath)) {
            this.extensions.set(ext.manifestPath, ext)
          }
        })
      })
    }
  }

  loadOnMain() {
    logger.info('[EXTENSIONS-LOADER]: load on main')
    this.autoloadExtensions((extension: LensMainExtension) => {
      extension.register(menuRegistry, extension.registerAppMenus(menuRegistry))
    })
  }

  loadOnClusterManagerRenderer() {
    logger.info('[EXTENSIONS-LOADER]: load on main renderer (cluster manager)')
    this.autoloadExtensions((extension: LensRendererExtension) => {
      extension.register(globalPageRegistry, extension.registerGlobalPages(globalPageRegistry))
      extension.register(appPreferenceRegistry, extension.registerAppPreferences(appPreferenceRegistry))
      extension.register(clusterFeatureRegistry, extension.registerClusterFeatures(clusterFeatureRegistry))
      extension.register(statusBarRegistry, extension.registerStatusBarItems(statusBarRegistry))
    })
  }

  loadOnClusterRenderer() {
    logger.info('[EXTENSIONS-LOADER]: load on cluster renderer (dashboard)')
    this.autoloadExtensions((extension: LensRendererExtension) => {
      extension.register(clusterPageRegistry, extension.registerClusterPages(clusterPageRegistry))
      extension.register(kubeObjectMenuRegistry, extension.registerKubeObjectMenus(kubeObjectMenuRegistry))
    })
  }

  protected autoloadExtensions(callback: (instance: LensExtension) => void) {
    return reaction(() => this.extensions.toJS(), (installedExtensions) => {
      for(const [id, ext] of installedExtensions) {
        let instance = this.instances.get(ext.id)
        if (!instance) {
          const extensionModule = this.requireExtension(ext)
          if (!extensionModule) {
            continue
          }
          const LensExtensionClass = extensionModule.default;
          instance = new LensExtensionClass({ ...ext.manifest, manifestPath: ext.manifestPath, id: ext.manifestPath }, ext.manifest);
          try {
            instance.enable()
            callback(instance)
          } finally {
            this.instances.set(ext.id, instance)
          }
        }
      }
    }, {
      fireImmediately: true,
      delay: 0,
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

  getById(id: ExtensionId): InstalledExtension {
    return this.extensions.get(id);
  }

  async removeById(id: ExtensionId) {
    const extension = this.getById(id);
    if (extension) {
      const instance = this.instances.get(extension.id)
      if (instance) {
        await instance.disable()
      }
      this.extensions.delete(id);
    }
  }

  broadcastExtensions(frameId?: number) {
    broadcastIpc({
      channel: "extensions:loaded",
      frameId: frameId,
      frameOnly: !!frameId,
      args: [this.toJSON().extensions],
    })
  }

  toJSON() {
    return toJS({
      extensions: Array.from(this.extensions).map(([id, instance]) => instance),
    }, {
      recurseEverything: true,
    })
  }
}

export const extensionLoader = new ExtensionLoader()
