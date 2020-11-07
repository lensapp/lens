import type { LensExtension, LensExtensionConstructor, LensExtensionId } from "./lens-extension"
import type { LensMainExtension } from "./lens-main-extension"
import type { LensRendererExtension } from "./lens-renderer-extension"
import type { InstalledExtension } from "./extension-manager";
import path from "path"
import { broadcastIpc } from "../common/ipc"
import { action, computed, observable, reaction, toJS, when } from "mobx"
import logger from "../main/logger"
import { app, ipcRenderer, remote } from "electron"
import * as registries from "./registries";
import { extensionsStore } from "./extensions-store";

// lazy load so that we get correct userData
export function extensionPackagesRoot() {
  return path.join((app || remote.app).getPath("userData"))
}

export class ExtensionLoader {
  protected extensions = observable.map<LensExtensionId, InstalledExtension>();
  protected instances = observable.map<LensExtensionId, LensExtension>();

  @observable isLoaded = false;
  whenLoaded = when(() => this.isLoaded);

  constructor() {
    if (ipcRenderer) {
      ipcRenderer.on("extensions:loaded", (event, extensions: [LensExtensionId, InstalledExtension][]) => {
        this.isLoaded = true;
        extensions.forEach(([extId, ext]) => {
          if (!this.extensions.has(extId)) {
            this.extensions.set(extId, ext)
          }
        })
      });
    }
    extensionsStore.manageState(this);
  }

  @computed get userExtensions(): Map<LensExtensionId, InstalledExtension> {
    const extensions = this.extensions.toJS();
    extensions.forEach((ext, extId) => {
      if (ext.isBundled) {
        extensions.delete(extId);
      }
    })
    return extensions;
  }

  @action
  async init(extensions: Map<LensExtensionId, InstalledExtension>) {
    this.extensions.replace(extensions);
    this.isLoaded = true;
    this.loadOnMain();
    this.broadcastExtensions();
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
    return reaction(() => this.toJSON(), installedExtensions => {
      for (const [extId, ext] of installedExtensions) {
        let instance = this.instances.get(extId);
        if (ext.isEnabled && !instance) {
          try {
            const LensExtensionClass: LensExtensionConstructor = this.requireExtension(ext)
            if (!LensExtensionClass) continue;
            instance = new LensExtensionClass(ext);
            instance.whenEnabled(() => register(instance));
            instance.enable();
            this.instances.set(extId, instance);
          } catch (err) {
            logger.error(`[EXTENSION-LOADER]: activation extension error`, { ext, err })
          }
        } else if (!ext.isEnabled && instance) {
          try {
            instance.disable();
            this.instances.delete(extId);
          } catch (err) {
            logger.error(`[EXTENSION-LOADER]: deactivation extension error`, { ext, err })
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
        return __non_webpack_require__(extEntrypoint).default;
      }
    } catch (err) {
      console.error(`[EXTENSION-LOADER]: can't load extension main at ${extEntrypoint}: ${err}`, { extension });
      console.trace(err)
    }
  }

  getExtension(extId: LensExtensionId): InstalledExtension {
    return this.extensions.get(extId);
  }

  toJSON(): Map<LensExtensionId, InstalledExtension> {
    return toJS(this.extensions, {
      exportMapsAsObjects: false,
      recurseEverything: true,
    })
  }

  async broadcastExtensions(frameId?: number) {
    await when(() => this.isLoaded);
    broadcastIpc({
      channel: "extensions:loaded",
      frameId: frameId,
      frameOnly: !!frameId,
      args: [
        Array.from(this.toJSON()),
      ],
    })
  }
}

export const extensionLoader = new ExtensionLoader();
