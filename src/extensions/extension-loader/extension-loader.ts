/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ipcRenderer } from "electron";
import { EventEmitter } from "events";
import { isEqual } from "lodash";
import { action, computed, makeObservable, observable, observe, reaction, when } from "mobx";
import path from "path";
import { broadcastMessage, ipcMainOn, ipcRendererOn, ipcMainHandle } from "../../common/ipc";
import type { Disposer } from "../../common/utils";
import { isDefined, toJS } from "../../common/utils";
import logger from "../../main/logger";
import type { CatalogEntity, KubernetesCluster } from "../common-api/catalog";
import type { InstalledExtension } from "../extension-discovery/extension-discovery";
import type { LensExtension, LensExtensionConstructor, LensExtensionId } from "../lens-extension";
import type { LensRendererExtension } from "../lens-renderer-extension";
import * as registries from "../registries";
import type { LensExtensionState } from "../extensions-store/extensions-store";
import { extensionLoaderFromMainChannel, extensionLoaderFromRendererChannel } from "../../common/ipc/extension-handling";
import { requestExtensionLoaderInitialState } from "../../renderer/ipc";
import assert from "assert";

const logModule = "[EXTENSIONS-LOADER]";

interface Dependencies {
  updateExtensionsState: (extensionsState: Record<LensExtensionId, LensExtensionState>) => void;
  createExtensionInstance: (ExtensionClass: LensExtensionConstructor, extension: InstalledExtension) => LensExtension;
  extensionRegistrators: ((extension: LensExtension, extensionInstallationCount: number) => void)[];
  extensionInstallationCounter: Map<string, number>;
}

export interface ExtensionLoading {
  isBundled: boolean;
  loaded: Promise<void>;
}

/**
 * Loads installed extensions to the Lens application
 */
export class ExtensionLoader {
  protected extensions = observable.map<LensExtensionId, InstalledExtension>();
  protected instances = observable.map<LensExtensionId, LensExtension>();

  /**
   * This is the set of extensions that don't come with either
   * - Main.LensExtension when running in the main process
   * - Renderer.LensExtension when running in the renderer process
   */
  protected nonInstancesByName = observable.set<string>();

  /**
   * This is updated by the `observe` in the constructor. DO NOT write directly to it
   */
  protected instancesByName = observable.map<string, LensExtension>();

  // emits event "remove" of type LensExtension when the extension is removed
  private events = new EventEmitter();

  @observable isLoaded = false;

  get whenLoaded() {
    return when(() => this.isLoaded);
  }

  constructor(protected dependencies : Dependencies) {
    makeObservable(this);

    observe(this.instances, change => {
      switch (change.type) {
        case "add":
          if (this.instancesByName.has(change.newValue.name)) {
            throw new TypeError("Extension names must be unique");
          }

          this.instancesByName.set(change.newValue.name, change.newValue);
          break;
        case "delete":
          this.instancesByName.delete(change.oldValue.name);
          break;
        case "update":
          throw new Error("Extension instances shouldn't be updated");
      }
    });
  }

  @computed get enabledExtensionInstances() : LensExtension[] {
    return [...this.instances.values()].filter(extension => extension.isEnabled);
  }

  @computed get userExtensions(): Map<LensExtensionId, InstalledExtension> {
    const extensions = this.toJSON();

    extensions.forEach((ext, extId) => {
      if (ext.isBundled) {
        extensions.delete(extId);
      }
    });

    return extensions;
  }

  /**
   * Get the extension instance by its manifest name
   * @param name The name of the extension
   * @returns one of the following:
   * - the instance of `Main.LensExtension` on the main process if created
   * - the instance of `Renderer.LensExtension` on the renderer process if created
   * - `null` if no class definition is provided for the current process
   * - `undefined` if the name is not known about
   */
  getInstanceByName(name: string): LensExtension | null | undefined {
    if (this.nonInstancesByName.has(name)) {
      return null;
    }

    return this.instancesByName.get(name);
  }

  // Transform userExtensions to a state object for storing into ExtensionsStore
  @computed get storeState() {
    return Object.fromEntries(
      Array.from(this.userExtensions)
        .map(([extId, extension]) => [extId, {
          enabled: extension.isEnabled,
          name: extension.manifest.name,
        }]),
    );
  }

  @action
  async init() {
    if (ipcRenderer) {
      await this.initRenderer();
    } else {
      await this.initMain();
    }

    await Promise.all([this.whenLoaded]);

    // broadcasting extensions between main/renderer processes
    reaction(() => this.toJSON(), () => this.broadcastExtensions(), {
      fireImmediately: true,
    });

    reaction(
      () => this.storeState,

      (state) => {
        this.dependencies.updateExtensionsState(state);
      },
    );
  }

  initExtensions(extensions: Map<LensExtensionId, InstalledExtension>) {
    this.extensions.replace(extensions);
  }

  addExtension(extension: InstalledExtension) {
    this.extensions.set(extension.id, extension);
  }

  @action
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
      this.nonInstancesByName.delete(instance.name);
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

  setIsEnabled(lensExtensionId: LensExtensionId, isEnabled: boolean) {
    const extension = this.extensions.get(lensExtensionId);

    assert(extension, `Must register extension ${lensExtensionId} with before enabling it`);

    extension.isEnabled = isEnabled;
  }

  protected async initMain() {
    this.isLoaded = true;
    this.loadOnMain();

    ipcMainHandle(extensionLoaderFromMainChannel, () => {
      return Array.from(this.toJSON());
    });

    ipcMainOn(extensionLoaderFromRendererChannel, (event, extensions: [LensExtensionId, InstalledExtension][]) => {
      this.syncExtensions(extensions);
    });
  }

  protected async initRenderer() {
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

    requestExtensionLoaderInitialState().then(extensionListHandler);
    ipcRendererOn(extensionLoaderFromMainChannel, (event, extensions: [LensExtensionId, InstalledExtension][]) => {
      extensionListHandler(extensions);
    });
  }

  broadcastExtensions() {
    const channel = ipcRenderer
      ? extensionLoaderFromRendererChannel
      : extensionLoaderFromMainChannel;

    broadcastMessage(channel, Array.from(this.extensions));
  }

  syncExtensions(extensions: [LensExtensionId, InstalledExtension][]) {
    extensions.forEach(([lensExtensionId, extension]) => {
      if (!isEqual(this.extensions.get(lensExtensionId), extension)) {
        this.extensions.set(lensExtensionId, extension);
      }
    });
  }

  loadOnMain() {
    this.autoInitExtensions(() => Promise.resolve([]));
  }

  loadOnClusterManagerRenderer = () => {
    logger.debug(`${logModule}: load on main renderer (cluster manager)`);

    return this.autoInitExtensions(async (ext) => {
      const extension = ext as LensRendererExtension;
      const removeItems = [
        registries.EntitySettingRegistry.getInstance().add(extension.entitySettings),
        registries.CatalogEntityDetailRegistry.getInstance().add(extension.catalogEntityDetailItems),
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
  };

  loadOnClusterRenderer = (getCluster: () => CatalogEntity) => {
    logger.debug(`${logModule}: load on cluster renderer (dashboard)`);

    this.autoInitExtensions(async (ext) => {
      const entity = getCluster() as KubernetesCluster;
      const extension = ext as LensRendererExtension;

      // getCluster must be a callback, as the entity might be available only after an extension has been loaded
      if ((await extension.isEnabledForCluster(entity)) === false) {
        return [];
      }

      const removeItems = [
        registries.KubeObjectDetailRegistry.getInstance().add(extension.kubeObjectDetailItems),
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
  };

  protected async loadExtensions(installedExtensions: Map<string, InstalledExtension>, register: (ext: LensExtension) => Promise<Disposer[]>) {
    // Steps of the function:
    // 1. require and call .activate for each Extension
    // 2. Wait until every extension's onActivate has been resolved
    // 3. Call .enable for each extension
    // 4. Return ExtensionLoading[]

    const extensions = [...installedExtensions.entries()]
      .map(([extId, extension]) => {
        const alreadyInit = this.instances.has(extId) || this.nonInstancesByName.has(extension.manifest.name);

        if (extension.isCompatible && extension.isEnabled && !alreadyInit) {
          try {
            const LensExtensionClass = this.requireExtension(extension);

            if (!LensExtensionClass) {
              this.nonInstancesByName.add(extension.manifest.name);

              return null;
            }

            const instance = this.dependencies.createExtensionInstance(
              LensExtensionClass,
              extension,
            );

            this.instances.set(extId, instance);

            return {
              instance,
              installedExtension: extension,
              activated: instance.activate(),
            };
          } catch (err) {
            logger.error(`${logModule}: error loading extension`, { ext: extension, err });
          }
        } else if (!extension.isEnabled && alreadyInit) {
          this.removeInstance(extId);
        }

        return null;
      })
      // Remove null values
      .filter(isDefined);

    // We first need to wait until each extension's `onActivate` is resolved or rejected,
    // as this might register new catalog categories. Afterwards we can safely .enable the extension.
    await Promise.all(
      extensions.map(extension =>
        // If extension activation fails, log error
        extension.activated.catch((error) => {
          logger.error(`${logModule}: activation extension error`, { ext: extension.installedExtension, error });
        }),
      ),
    );

    extensions.forEach(({ instance }) => {
      const installationCount = (this.dependencies.extensionInstallationCounter.get(instance.sanitizedExtensionId) ?? 0) + 1;

      this.dependencies.extensionInstallationCounter.set(instance.sanitizedExtensionId, installationCount);

      this.dependencies.extensionRegistrators.forEach((register) =>
        register(instance, installationCount),
      );
    });

    // Return ExtensionLoading[]
    return extensions.map(extension => {
      const loaded = extension.instance.enable(register).catch((err) => {
        logger.error(`${logModule}: failed to enable`, { ext: extension, err });
      });

      return {
        isBundled: extension.installedExtension.isBundled,
        loaded,
      };
    });
  }

  protected autoInitExtensions(register: (ext: LensExtension) => Promise<Disposer[]>) {
    // Setup reaction to load extensions on JSON changes
    reaction(() => this.toJSON(), installedExtensions => this.loadExtensions(installedExtensions, register));

    // Load initial extensions
    return this.loadExtensions(this.toJSON(), register);
  }

  protected requireExtension(extension: InstalledExtension): LensExtensionConstructor | null {
    const entryPointName = ipcRenderer ? "renderer" : "main";
    const extRelativePath = extension.manifest[entryPointName];

    if (!extRelativePath) {
      return null;
    }

    const extAbsolutePath = path.resolve(path.join(path.dirname(extension.manifestPath), extRelativePath));

    try {
      return __non_webpack_require__(extAbsolutePath).default;
    } catch (error) {
      if (window && error instanceof window.Error) {
        console.error(`${logModule}: can't load ${entryPointName} for "${extension.manifest.name}": ${error.stack || error}`, extension);
      } else {
        logger.error(`${logModule}: can't load ${entryPointName} for "${extension.manifest.name}": ${error}`, { extension });
      }
    }

    return null;
  }

  getExtension(extId: LensExtensionId) {
    return this.extensions.get(extId);
  }

  getInstanceById(extId: LensExtensionId) {
    return this.instances.get(extId);
  }

  toJSON(): Map<LensExtensionId, InstalledExtension> {
    return toJS(this.extensions);
  }
}
