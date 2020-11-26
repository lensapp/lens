import { app, ipcRenderer, remote } from "electron";
import { EventEmitter } from "events";
import { action, computed, observable, reaction, toJS, when } from "mobx";
import path from "path";
import { getHostedCluster } from "../common/cluster-store";
import { broadcastMessage, handleRequest, requestMain, subscribeToBroadcast } from "../common/ipc";
import logger from "../main/logger";
import type { InstalledExtension } from "./extension-discovery";
import { extensionsStore } from "./extensions-store";
import type { LensExtension, LensExtensionConstructor, LensExtensionId } from "./lens-extension";
import type { LensMainExtension } from "./lens-main-extension";
import type { LensRendererExtension } from "./lens-renderer-extension";
import * as registries from "./registries";

// lazy load so that we get correct userData
export function extensionPackagesRoot() {
  return path.join((app || remote.app).getPath("userData"));
}

const logModule = "[EXTENSIONS-LOADER]";

/**
 * Loads installed extensions to the Lens application
 */
export class ExtensionLoader {
  protected extensions = observable.map<LensExtensionId, InstalledExtension>();
  protected instances = observable.map<LensExtensionId, LensExtension>();
  protected readonly requestExtensionsChannel = "extensions:loaded";

  // emits event "remove" of type LensExtension when the extension is removed
  private events = new EventEmitter();

  @observable isLoaded = false;
  whenLoaded = when(() => this.isLoaded);

  @computed get userExtensions(): Map<LensExtensionId, InstalledExtension> {
    const extensions = this.extensions.toJS();

    extensions.forEach((ext, extId) => {
      if (ext.isBundled) {
        extensions.delete(extId);
      }
    });

    return extensions;
  }

  @action
  async init() {
    if (ipcRenderer) {
      await this.initRenderer();
    } else {
      await this.initMain();
    }

    extensionsStore.manageState(this);
  }

  initExtensions(extensions?: Map<LensExtensionId, InstalledExtension>) {
    this.extensions.replace(extensions);
  }

  addExtension(extension: InstalledExtension) {
    this.extensions.set(extension.manifestPath as LensExtensionId, extension);
  }

  removeInstance(lensExtensionId: LensExtensionId) {
    logger.info(`${logModule} deleting extension instance ${lensExtensionId}`);
    const instance = this.instances.get(lensExtensionId);

    if (instance) {
      try {
        instance.disable();
        this.events.emit("remove", instance);
        this.instances.delete(lensExtensionId);
      } catch (error) {
        logger.error(`${logModule}: deactivation extension error`, { lensExtensionId, error });
      }
    }
  }

  removeExtension(lensExtensionId: LensExtensionId) {
    this.removeInstance(lensExtensionId);

    if (!this.extensions.delete(lensExtensionId)) {
      throw new Error(`Can't remove extension ${lensExtensionId}, doesn't exist.`);
    }

  }

  protected async initMain() {
    this.isLoaded = true;
    this.loadOnMain();
    this.broadcastExtensions();

    reaction(() => this.extensions.toJS(), () => {
      this.broadcastExtensions();
    });

    handleRequest(this.requestExtensionsChannel, () => {
      return Array.from(this.toJSON());
    });
  }

  protected async initRenderer() {
    const extensionListHandler = (extensions: [LensExtensionId, InstalledExtension][]) => {
      this.isLoaded = true;
      const receivedExtensionIds = extensions.map(([lensExtensionId]) => lensExtensionId);

      // Add new extensions
      extensions.forEach(([extId, ext]) => {
        if (!this.extensions.has(extId)) {
          this.extensions.set(extId, ext);
        }
      });

      // Remove deleted extensions
      this.extensions.forEach((_, lensExtensionId) => {
        if (!receivedExtensionIds.includes(lensExtensionId)) {
          this.removeExtension(lensExtensionId);
        }
      });
    };

    requestMain(this.requestExtensionsChannel).then(extensionListHandler);
    subscribeToBroadcast(this.requestExtensionsChannel, (event, extensions: [LensExtensionId, InstalledExtension][]) => {
      extensionListHandler(extensions);
    });
  }

  loadOnMain() {
    logger.info(`${logModule}: load on main`);
    this.autoInitExtensions(async (extension: LensMainExtension) => {
      // Each .add returns a function to remove the item
      const removeItems = [
        registries.menuRegistry.add(extension.appMenus)
      ];

      this.events.on("remove", (removedExtension: LensRendererExtension) => {
        // manifestPath is considered the id
        if (removedExtension.manifestPath === extension.manifestPath) {
          removeItems.forEach(remove => {
            remove();
          });
        }
      });

      return removeItems;
    });
  }

  loadOnClusterManagerRenderer() {
    logger.info(`${logModule}: load on main renderer (cluster manager)`);
    this.autoInitExtensions(async (extension: LensRendererExtension) => {
      const removeItems = [
        registries.globalPageRegistry.add(extension.globalPages, extension),
        registries.globalPageMenuRegistry.add(extension.globalPageMenus, extension),
        registries.appPreferenceRegistry.add(extension.appPreferences),
        registries.clusterFeatureRegistry.add(extension.clusterFeatures),
        registries.statusBarRegistry.add(extension.statusBarItems),
      ];

      this.events.on("remove", (removedExtension: LensRendererExtension) => {
        if (removedExtension.manifestPath === extension.manifestPath) {
          removeItems.forEach(remove => {
            remove();
          });
        }
      });

      return removeItems;
    });
  }

  loadOnClusterRenderer() {
    logger.info(`${logModule}: load on cluster renderer (dashboard)`);
    const cluster = getHostedCluster();
    this.autoInitExtensions(async (extension: LensRendererExtension) => {
      if (await extension.isEnabledForCluster(cluster) === false) {
        return [];
      }

      const removeItems = [
        registries.clusterPageRegistry.add(extension.clusterPages, extension),
        registries.clusterPageMenuRegistry.add(extension.clusterPageMenus, extension),
        registries.kubeObjectMenuRegistry.add(extension.kubeObjectMenuItems),
        registries.kubeObjectDetailRegistry.add(extension.kubeObjectDetailItems),
        registries.kubeObjectStatusRegistry.add(extension.kubeObjectStatusTexts)
      ];

      this.events.on("remove", (removedExtension: LensRendererExtension) => {
        if (removedExtension.manifestPath === extension.manifestPath) {
          removeItems.forEach(remove => {
            remove();
          });
        }
      });

      return removeItems;
    });
  }

  protected autoInitExtensions(register: (ext: LensExtension) => Promise<Function[]>) {
    return reaction(() => this.toJSON(), installedExtensions => {
      for (const [extId, ext] of installedExtensions) {
        const alreadyInit = this.instances.has(extId);

        if (ext.isEnabled && !alreadyInit) {
          try {
            const LensExtensionClass = this.requireExtension(ext);
            if (!LensExtensionClass) {
              continue;
            }

            const instance = new LensExtensionClass(ext);
            instance.whenEnabled(() => register(instance));
            instance.enable();
            this.instances.set(extId, instance);
          } catch (err) {
            logger.error(`${logModule}: activation extension error`, { ext, err });
          }
        } else if (!ext.isEnabled && alreadyInit) {
          this.removeInstance(extId);
        }
      }
    }, {
      fireImmediately: true,
    });
  }

  protected requireExtension(extension: InstalledExtension): LensExtensionConstructor {
    let extEntrypoint = "";
    try {
      if (ipcRenderer && extension.manifest.renderer) {
        extEntrypoint = path.resolve(path.join(path.dirname(extension.manifestPath), extension.manifest.renderer));
      } else if (!ipcRenderer && extension.manifest.main) {
        extEntrypoint = path.resolve(path.join(path.dirname(extension.manifestPath), extension.manifest.main));
      }
      if (extEntrypoint !== "") {
        return __non_webpack_require__(extEntrypoint).default;
      }
    } catch (err) {
      console.error(`${logModule}: can't load extension main at ${extEntrypoint}: ${err}`, { extension });
      console.trace(err);
    }
  }

  getExtension(extId: LensExtensionId): InstalledExtension {
    return this.extensions.get(extId);
  }

  toJSON(): Map<LensExtensionId, InstalledExtension> {
    return toJS(this.extensions, {
      exportMapsAsObjects: false,
      recurseEverything: true,
    });
  }

  broadcastExtensions() {
    broadcastMessage(this.requestExtensionsChannel, Array.from(this.toJSON()));
  }
}

export const extensionLoader = new ExtensionLoader();
