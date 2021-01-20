import { app, ipcRenderer, remote } from "electron";
import { EventEmitter } from "events";
import { isEqual } from "lodash";
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
import fs from "fs";


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

  // IPC channel to broadcast changes to extensions from main
  protected static readonly extensionsMainChannel = "extensions:main";

  // IPC channel to broadcast changes to extensions from renderer
  protected static readonly extensionsRendererChannel = "extensions:renderer";

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

  @computed get userExtensionsByName(): Map<string, LensExtension> {
    const res = new Map();

    for (const [, val] of this.instances) {
      if (val.isBundled) {
        continue;
      }

      res.set(val.manifest.name, val);
    }

    return res;
  }

  // Transform userExtensions to a state object for storing into ExtensionsStore
  @computed get storeState() {
    return Object.fromEntries(
      Array.from(this.userExtensions)
        .map(([extId, extension]) => [extId, {
          enabled: extension.isEnabled,
          name: extension.manifest.name,
        }])
    );
  }

  @action
  async init() {
    if (ipcRenderer) {
      await this.initRenderer();
    } else {
      await this.initMain();
    }

    await Promise.all([this.whenLoaded, extensionsStore.whenLoaded]);

    // save state on change `extension.isEnabled`
    reaction(() => this.storeState, extensionsState => {
      extensionsStore.mergeState(extensionsState);
    });
  }

  initExtensions(extensions?: Map<LensExtensionId, InstalledExtension>) {
    this.extensions.replace(extensions);
  }

  addExtension(extension: InstalledExtension) {
    this.extensions.set(extension.id, extension);
  }

  removeInstance(lensExtensionId: LensExtensionId) {
    logger.info(`${logModule} deleting extension instance ${lensExtensionId}`);
    const instance = this.instances.get(lensExtensionId);

    if (!instance) {
      return;
    }

    try {
      instance.disable();
      this.events.emit("remove", instance);
      this.instances.delete(lensExtensionId);
    } catch (error) {
      logger.error(`${logModule}: deactivation extension error`, { lensExtensionId, error });
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

    reaction(() => this.toJSON(), () => {
      this.broadcastExtensions();
    });

    handleRequest(ExtensionLoader.extensionsMainChannel, () => {
      return Array.from(this.toJSON());
    });

    subscribeToBroadcast(ExtensionLoader.extensionsRendererChannel, (_event, extensions: [LensExtensionId, InstalledExtension][]) => {
      this.syncExtensions(extensions);
    });
  }

  protected async initRenderer() {
    const extensionListHandler = (extensions: [LensExtensionId, InstalledExtension][]) => {
      this.isLoaded = true;
      this.syncExtensions(extensions);

      const receivedExtensionIds = extensions.map(([lensExtensionId]) => lensExtensionId);

      // Remove deleted extensions in renderer side only
      this.extensions.forEach((_, lensExtensionId) => {
        if (!receivedExtensionIds.includes(lensExtensionId)) {
          this.removeExtension(lensExtensionId);
        }
      });
    };

    reaction(() => this.toJSON(), () => {
      this.broadcastExtensions(false);
    });

    requestMain(ExtensionLoader.extensionsMainChannel).then(extensionListHandler);
    subscribeToBroadcast(ExtensionLoader.extensionsMainChannel, (_event, extensions: [LensExtensionId, InstalledExtension][]) => {
      extensionListHandler(extensions);
    });
  }

  syncExtensions(extensions: [LensExtensionId, InstalledExtension][]) {
    extensions.forEach(([lensExtensionId, extension]) => {
      if (!isEqual(this.extensions.get(lensExtensionId), extension)) {
        this.extensions.set(lensExtensionId, extension);
      }
    });
  }

  loadOnMain() {
    logger.debug(`${logModule}: load on main`);
    this.autoInitExtensions(async (extension: LensMainExtension) => {
      // Each .add returns a function to remove the item
      const removeItems = [
        registries.menuRegistry.add(extension.appMenus)
      ];

      this.events.on("remove", (removedExtension: LensRendererExtension) => {
        if (removedExtension.id === extension.id) {
          removeItems.forEach(remove => {
            remove();
          });
        }
      });

      return removeItems;
    });
  }

  loadOnClusterManagerRenderer() {
    logger.debug(`${logModule}: load on main renderer (cluster manager)`);
    this.autoInitExtensions(async (extension: LensRendererExtension) => {
      const removeItems = [
        registries.globalPageRegistry.add(extension.globalPages, extension),
        registries.globalPageMenuRegistry.add(extension.globalPageMenus, extension),
        registries.appPreferenceRegistry.add(extension.appPreferences),
        registries.clusterFeatureRegistry.add(extension.clusterFeatures),
        registries.statusBarRegistry.add(extension.statusBarItems),
      ];

      this.events.on("remove", (removedExtension: LensRendererExtension) => {
        if (removedExtension.id === extension.id) {
          removeItems.forEach(remove => {
            remove();
          });
        }
      });

      return removeItems;
    });
  }

  loadOnClusterRenderer() {
    logger.debug(`${logModule}: load on cluster renderer (dashboard)`);
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
        if (removedExtension.id === extension.id) {
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
      for (const [extId, extension] of installedExtensions) {
        const alreadyInit = this.instances.has(extId);

        if (extension.isEnabled && !alreadyInit) {
          try {
            const LensExtensionClass = this.requireExtension(extension);

            if (!LensExtensionClass) {
              continue;
            }

            const instance = new LensExtensionClass(extension);

            instance.whenEnabled(() => register(instance));
            instance.enable();
            this.instances.set(extId, instance);
          } catch (err) {
            logger.error(`${logModule}: activation extension error`, { ext: extension, err });
          }
        } else if (!extension.isEnabled && alreadyInit) {
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
        if (!fs.existsSync(extEntrypoint)) {
          console.log(`${logModule}: entrypoint ${extEntrypoint} not found, skipping ...`);

          return;
        }

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

  broadcastExtensions(main = true) {
    broadcastMessage(main ? ExtensionLoader.extensionsMainChannel : ExtensionLoader.extensionsRendererChannel, Array.from(this.toJSON()));
  }
}

export const extensionLoader = new ExtensionLoader();
