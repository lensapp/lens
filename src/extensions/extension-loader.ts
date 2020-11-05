import type { LensExtension, LensExtensionConstructor, LensExtensionId } from "./lens-extension"
import type { LensMainExtension } from "./lens-main-extension"
import type { LensRendererExtension } from "./lens-renderer-extension"
import type { InstalledExtension } from "./extension-manager";
import path from "path"
import { broadcastIpc } from "../common/ipc"
import { computed, observable, reaction, when } from "mobx"
import logger from "../main/logger"
import { app, ipcRenderer, remote } from "electron"
import * as registries from "./registries";

// lazy load so that we get correct userData
export function extensionPackagesRoot() {
  return path.join((app || remote.app).getPath("userData"))
}

export class ExtensionLoader {
  @observable isLoaded = false;
  protected extensions = observable.map<LensExtensionId, InstalledExtension>([], { deep: false });
  protected instances = observable.map<LensExtensionId, LensExtension>([], { deep: false })

  constructor() {
    if (ipcRenderer) {
      ipcRenderer.on("extensions:loaded", (event, extensions: InstalledExtension[]) => {
        this.isLoaded = true;
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

  async init() {
    const { extensionManager } = await import("./extension-manager");
    const installedExtensions = await extensionManager.load();
    this.extensions.replace(installedExtensions);
    this.isLoaded = true;
    this.loadOnMain();
  }

  loadOnMain() {
    logger.info('[EXTENSIONS-LOADER]: load on main')
    this.autoInitExtensions((extension: LensMainExtension) => [
      registries.menuRegistry.add(...extension.appMenus)
    ]);
  }

  loadOnClusterManagerRenderer() {
    logger.info('[EXTENSIONS-LOADER]: load on main renderer (cluster manager)')
    this.autoInitExtensions((extension: LensRendererExtension) => [
      registries.globalPageRegistry.add(...extension.globalPages),
      registries.appPreferenceRegistry.add(...extension.appPreferences),
      registries.clusterFeatureRegistry.add(...extension.clusterFeatures),
      registries.statusBarRegistry.add(...extension.statusBarItems),
    ]);
  }

  loadOnClusterRenderer() {
    logger.info('[EXTENSIONS-LOADER]: load on cluster renderer (dashboard)')
    this.autoInitExtensions((extension: LensRendererExtension) => [
      registries.clusterPageRegistry.add(...extension.clusterPages),
      registries.kubeObjectMenuRegistry.add(...extension.kubeObjectMenuItems),
      registries.kubeObjectDetailRegistry.add(...extension.kubeObjectDetailItems),
    ]);
  }

  protected autoInitExtensions(register: (ext: LensExtension) => Function[]) {
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
            instance.whenEnabled(() => register(instance));
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

  async broadcastExtensions(frameId?: number) {
    await when(() => this.isLoaded);
    broadcastIpc({
      channel: "extensions:loaded",
      frameId: frameId,
      frameOnly: !!frameId,
      args: [
        Array.from(this.extensions.toJS().values())
      ],
    })
  }
}

export const extensionLoader = new ExtensionLoader();
