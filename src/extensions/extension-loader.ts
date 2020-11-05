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
  @observable isLoaded = false;
  protected extensions = observable.map<LensExtensionId, InstalledExtension>();
  protected instances = observable.map<LensExtensionId, LensExtension>()

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
    this.manageExtensionsState();
  }

  @computed get userExtensions(): InstalledExtension[] {
    return Array.from(this.toJSON().values()).filter(ext => !ext.isBundled)
  }

  protected async manageExtensionsState() {
    await extensionsStore.whenLoaded;
    await when(() => this.isLoaded);

    // apply initial state
    this.extensions.forEach((ext, extId) => {
      ext.enabled = ext.isBundled || extensionsStore.isEnabled(extId);
    })

    // handle updated state from store
    reaction(() => extensionsStore.extensions.toJS(), extensionsState => {
      extensionsState.forEach((state, extId) => {
        const ext = this.extensions.get(extId);
        if (ext && !ext.isBundled && ext.enabled !== state.enabled) {
          ext.enabled = state.enabled;
        }
      })
    });
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
    return reaction(() => this.toJSON(), (installedExtensions) => {
      for (const [extId, ext] of installedExtensions) {
        let instance = this.instances.get(extId);
        if (ext.enabled && !instance) {
          const extensionModule = this.requireExtension(ext)
          if (!extensionModule) {
            continue;
          }
          try {
            const LensExtensionClass: LensExtensionConstructor = extensionModule.default;
            instance = new LensExtensionClass(ext);
            instance.whenEnabled(() => register(instance));
            instance.enable();
            this.instances.set(extId, instance);
          } catch (err) {
            logger.error(`[EXTENSIONS-LOADER]: init extension instance error`, { ext, err })
          }
        } else if (!ext.enabled && instance) {
          instance.disable();
          this.instances.delete(extId);
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

  toJSON() {
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
        Array.from(this.toJSON().values()),
      ],
    })
  }
}

export const extensionLoader = new ExtensionLoader();
