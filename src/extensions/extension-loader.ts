import type { LensExtension, LensExtensionConstructor, LensExtensionManifest } from "./lens-extension"
import type { LensMainExtension } from "./lens-main-extension"
import type { LensRendererExtension } from "./lens-renderer-extension"
import path from "path"
import { broadcastIpc } from "../common/ipc"
import { computed, observable, reaction, toJS, } from "mobx"
import logger from "../main/logger"
import { app, ipcRenderer, remote } from "electron"
import * as registries from "./registries";

type ExtensionManifestPath = string; // path to package.json

export interface InstalledExtension {
  manifestPath: string;
  manifest: LensExtensionManifest;
  isBundled?: boolean; // defined in package.json
}

// lazy load so that we get correct userData
export function extensionPackagesRoot() {
  return path.join((app || remote.app).getPath("userData"))
}

export class ExtensionLoader {
  @observable extensions = observable.map<ExtensionManifestPath, InstalledExtension>([], { deep: false });
  @observable instances = observable.map<ExtensionManifestPath, LensExtension>([], { deep: false })

  constructor() {
    if (ipcRenderer) {
      ipcRenderer.on("extensions:loaded", (event, extensions: InstalledExtension[]) => {
        extensions.forEach((ext) => {
          if (!this.getByManifest(ext.manifestPath)) {
            this.extensions.set(ext.manifestPath, ext)
          }
        })
      })
    }
  }

  @computed get userExtensions(): LensExtension[] {
    return [...this.instances.values()].filter(ext => !ext.isBundled)
  }

  loadOnMain() {
    logger.info('[EXTENSIONS-LOADER]: load on main')
    this.autoloadExtensions((extension: LensMainExtension) => {
      extension.registerTo(registries.menuRegistry, extension.appMenus)
    })
  }

  loadOnClusterManagerRenderer() {
    logger.info('[EXTENSIONS-LOADER]: load on main renderer (cluster manager)')
    this.autoloadExtensions((extension: LensRendererExtension) => {
      extension.registerTo(registries.globalPageRegistry, extension.globalPages)
      extension.registerTo(registries.appPreferenceRegistry, extension.appPreferences)
      extension.registerTo(registries.clusterFeatureRegistry, extension.clusterFeatures)
      extension.registerTo(registries.statusBarRegistry, extension.statusBarItems)
    })
  }

  loadOnClusterRenderer() {
    logger.info('[EXTENSIONS-LOADER]: load on cluster renderer (dashboard)')
    this.autoloadExtensions((extension: LensRendererExtension) => {
      extension.registerTo(registries.clusterPageRegistry, extension.clusterPages)
      extension.registerTo(registries.kubeObjectMenuRegistry, extension.kubeObjectMenuItems)
      extension.registerTo(registries.kubeObjectDetailRegistry, extension.kubeObjectDetailItems)
    })
  }

  protected autoloadExtensions(callback: (instance: LensExtension) => void) {
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
            instance.enable()
            callback(instance)
            this.instances.set(ext.manifestPath, instance)
          } catch (err) {
            logger.error(`[EXTENSIONS-LOADER]: activating extension error`, { ext, err })
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

  getByManifest(manifestPath: ExtensionManifestPath): InstalledExtension {
    return this.extensions.get(manifestPath);
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
