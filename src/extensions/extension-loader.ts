import type { ExtensionId, LensExtension, ExtensionManifest, ExtensionModel } from "./lens-extension"
import type { LensRendererExtension } from "./lens-renderer-extension"
import { broadcastIpc } from "../common/ipc"
import type { LensExtensionRuntimeEnv } from "./lens-runtime"
import path from "path"
import { observable, reaction, toJS, } from "mobx"
import logger from "../main/logger"
import { app, remote, ipcRenderer } from "electron"
import { pageRegistry } from "./page-registry";
import { appPreferenceRegistry } from "./app-preference-registry"
import { kubeObjectMenuRegistry } from "../renderer/api/kube-object-menu-registry"
import { clusterFeatureRegistry } from "./cluster-feature-registry"

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

  loadOnClusterRenderer(getLensRuntimeEnv: () => LensExtensionRuntimeEnv) {
    logger.info('[EXTENSIONS-LOADER]: load on cluster renderer')
    this.autoloadExtensions(getLensRuntimeEnv, (instance: LensRendererExtension) => {
      instance.registerPages(pageRegistry)
      instance.registerKubeObjectMenus(kubeObjectMenuRegistry)
    })
  }

  loadOnMainRenderer(getLensRuntimeEnv: () => LensExtensionRuntimeEnv) {
    logger.info('[EXTENSIONS-LOADER]: load on main renderer')
    this.autoloadExtensions(getLensRuntimeEnv, (instance: LensRendererExtension) => {
      instance.registerPages(pageRegistry)
      instance.registerAppPreferences(appPreferenceRegistry)
      instance.registerClusterFeatures(clusterFeatureRegistry)
    })
  }

  loadOnMain(getLensRuntimeEnv: () => LensExtensionRuntimeEnv) {
    logger.info('[EXTENSIONS-LOADER]: load on main')
    this.autoloadExtensions(getLensRuntimeEnv, (instance: LensExtension) => {
      // todo
    })
  }

  protected autoloadExtensions(getLensRuntimeEnv: () => LensExtensionRuntimeEnv, callback: (instance: LensExtension) => void) {
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
            instance.enable(getLensRuntimeEnv())
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
      if (instance) { await instance.disable() }
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
