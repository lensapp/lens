import type { ExtensionId, LensExtension, ExtensionManifest, ExtensionModel } from "./lens-extension"
import { broadcastIpc } from "../common/ipc"
import type { LensRuntimeRendererEnv } from "./lens-runtime"
import path from "path"
import { observable, reaction, toJS, } from "mobx"
import logger from "../main/logger"
import { app, remote, ipcRenderer } from "electron"

export interface InstalledExtension extends ExtensionModel {
  manifestPath: string;
  manifest: ExtensionManifest;
}

// lazy load so that we get correct userData
export function extensionPackagesRoot() {
  return path.join((app || remote.app).getPath("userData"))
}

export function withExtensionPackagesRoot(callback: Function) {
  const cwd = process.cwd()
  try {
    process.chdir(extensionPackagesRoot())
    return callback()
  } finally {
    process.chdir(cwd)
  }
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

  autoEnableOnLoad(getLensRuntimeEnv: () => LensRuntimeRendererEnv, { delay = 0 } = {}) {
    logger.info('[EXTENSIONS-LOADER]: auto-activation loaded extensions: ON');
    return reaction(() => this.extensions.toJS(), installedExtensions => {
      installedExtensions.forEach((ext) => {
        let instance = this.instances.get(ext.manifestPath)
        if (!instance) {
          const extensionModule = this.requireExtension(ext)
          if (!extensionModule) {
            logger.error("[EXTENSION-LOADER] failed to load extension " + ext.manifestPath)
            return
          }
          const LensExtensionClass = extensionModule.default;
          instance = new LensExtensionClass({ ...ext.manifest, manifestPath: ext.manifestPath, id: ext.manifestPath }, ext.manifest);
          instance.enable(getLensRuntimeEnv());
          this.instances.set(ext.id, instance)
        }
      })
    }, {
      fireImmediately: true,
      delay: delay,
    })
  }

  protected requireExtension(extension: InstalledExtension) {
    return withExtensionPackagesRoot(() => {
      try {
        const extMain = path.join(path.dirname(extension.manifestPath), extension.manifest.main)
        return __non_webpack_require__(extMain)
      } catch (err) {
        console.error(`[EXTENSION-LOADER]: can't load extension main at ${extension.manifestPath}: ${err}`, { extension });
      }
    })
  }

  getById(id: ExtensionId): InstalledExtension {
    return this.extensions.get(id);
  }

  async removeById(id: ExtensionId) {
    const extension = this.getById(id);
    if (extension) {
      const instance = this.instances.get(extension.id)
      if (instance) { await instance.uninstall() }
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
