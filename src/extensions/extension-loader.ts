import { app, ipcRenderer, remote } from "electron";
import { EventEmitter } from "events";
import { isEqual } from "lodash";
import { action, computed, observable, reaction, toJS, when } from "mobx";
import path from "path";
import { getHostedCluster } from "../common/cluster-store";
import { createTypedInvoker, createTypedSender, isEmptyArgs } from "../common/ipc";
import logger from "../main/logger";
import type { InstalledExtension } from "./extension-discovery";
import { extensionsStore } from "./extensions-store";
import type { LensExtension, LensExtensionConstructor, LensExtensionId } from "./lens-extension";
import type { LensMainExtension } from "./lens-main-extension";
import type { LensRendererExtension } from "./lens-renderer-extension";
import * as registries from "./registries";
import fs from "fs";
import { bindTypeGuard, isString, isTuple, isTypedArray } from "../common/utils/type-narrowing";

// lazy load so that we get correct userData
export function extensionPackagesRoot() {
  return path.join((app || remote.app).getPath("userData"));
}

const logModule = "[EXTENSIONS-LOADER]";

type InstalledExtensions = [extId: string, metadata: InstalledExtension][];

function isInstalledExtensions(args: unknown[]): args is InstalledExtensions {
  return isTypedArray(args, bindTypeGuard(isTuple, isString, isInstalledExtensions));
}

const installedExtensions = createTypedSender({
  channel: "extensions:installed",
  verifier: bindTypeGuard(isTuple, isInstalledExtensions),
});

const initialInstalledExtensions = createTypedInvoker({
  channel: "extensions:initial-installed",
  verifier: isEmptyArgs,
  handler: () => extensionLoader.toBroadcastData(),
});

/**
 * Loads installed extensions to the Lens application
 */
export class ExtensionLoader {
  protected extensions = observable.map<LensExtensionId, InstalledExtension>();
  protected instances = observable.map<LensExtensionId, LensExtension>();

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

  // Transform userExtensions to a state object for storing into ExtensionsStore
  @computed get storeState() {
    return Object.fromEntries(
      Array.from(this.userExtensions, ([extId, extension]) => [extId, {
        enabled: extension.isEnabled,
        name: extension.manifest.name,
      }])
    );
  }

  @action
  async init() {
    installedExtensions.on((event, extensions) => {
      this.isLoaded = true;
      this.syncExtensions(extensions);
    });

    reaction(() => this.toBroadcastData(), installedExtensions.broadcast);

    if (ipcRenderer) {
      await this.initRenderer();
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

  protected async initRenderer() {
    const initial = await initialInstalledExtensions.invoke();

    this.isLoaded = true;
    this.syncExtensions(initial);
  }

  @action
  protected syncExtensions(extensions: InstalledExtensions) {
    const receivedExtIds = new Set();

    for (const [extId, metadata] of extensions) {
      receivedExtIds.add(extId);

      if (!isEqual(this.extensions.get(extId), metadata)) {
        this.extensions.set(extId, metadata);
      }
    }

    if (ipcRenderer) {
      // Remove deleted extensions in renderer side only
      for (const extId of this.extensions.keys()) {
        if (!receivedExtIds.has(extId)) {
          this.removeExtension(extId);
        }
      }
    }
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
    return reaction(() => this.toBroadcastData(), installedExtensions => {
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

  toBroadcastData(): [LensExtensionId, InstalledExtension][] {
    return toJS(Array.from(this.extensions.entries()), {
      exportMapsAsObjects: false,
      recurseEverything: true,
    });
  }
}

export const extensionLoader = new ExtensionLoader();
