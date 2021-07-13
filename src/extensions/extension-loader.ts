/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { app, ipcRenderer, remote } from "electron";
import { EventEmitter } from "events";
import { isEqual } from "lodash";
import { action, computed, makeObservable, observable, observe, reaction, when } from "mobx";
import path from "path";
import { getHostedCluster } from "../common/cluster-store";
import { broadcastMessage, ipcMainOn, ipcRendererOn, requestMain, ipcMainHandle } from "../common/ipc";
import { Disposer, Singleton, toJS } from "../common/utils";
import logger from "../main/logger";
import type { InstalledExtension } from "./extension-discovery";
import { ExtensionsStore } from "./extensions-store";
import type { LensExtension, LensExtensionConstructor, LensExtensionId } from "./lens-extension";
import type { LensMainExtension } from "./lens-main-extension";
import type { LensRendererExtension } from "./lens-renderer-extension";
import * as registries from "./registries";

export function extensionPackagesRoot() {
  return path.join((app || remote.app).getPath("userData"));
}

const logModule = "[EXTENSIONS-LOADER]";

/**
 * Loads installed extensions to the Lens application
 */
export class ExtensionLoader extends Singleton {
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

  // IPC channel to broadcast changes to extensions from main
  protected static readonly extensionsMainChannel = "extensions:main";

  // IPC channel to broadcast changes to extensions from renderer
  protected static readonly extensionsRendererChannel = "extensions:renderer";

  // emits event "remove" of type LensExtension when the extension is removed
  private events = new EventEmitter();

  @observable isLoaded = false;

  get whenLoaded() {
    return when(() => this.isLoaded);
  }

  constructor() {
    super();
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

    await Promise.all([this.whenLoaded]);

    // broadcasting extensions between main/renderer processes
    reaction(() => this.toJSON(), () => this.broadcastExtensions(), {
      fireImmediately: true,
    });

    // save state on change `extension.isEnabled`
    reaction(() => this.storeState, extensionsState => {
      ExtensionsStore.getInstance().mergeState(extensionsState);
    });
  }

  initExtensions(extensions?: Map<LensExtensionId, InstalledExtension>) {
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
    this.extensions.get(lensExtensionId).isEnabled = isEnabled;
  }

  protected async initMain() {
    this.isLoaded = true;
    this.loadOnMain();

    ipcMainHandle(ExtensionLoader.extensionsMainChannel, () => {
      return Array.from(this.toJSON());
    });

    ipcMainOn(ExtensionLoader.extensionsRendererChannel, (event, extensions: [LensExtensionId, InstalledExtension][]) => {
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

    requestMain(ExtensionLoader.extensionsMainChannel).then(extensionListHandler);
    ipcRendererOn(ExtensionLoader.extensionsMainChannel, (event, extensions: [LensExtensionId, InstalledExtension][]) => {
      extensionListHandler(extensions);
    });
  }

  broadcastExtensions() {
    const channel = ipcRenderer
      ? ExtensionLoader.extensionsRendererChannel
      : ExtensionLoader.extensionsMainChannel;

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
    registries.MenuRegistry.createInstance();

    logger.debug(`${logModule}: load on main`);
    this.autoInitExtensions(async (extension: LensMainExtension) => {
      // Each .add returns a function to remove the item
      const removeItems = [
        registries.MenuRegistry.getInstance().add(extension.appMenus)
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
        registries.GlobalPageRegistry.getInstance().add(extension.globalPages, extension),
        registries.AppPreferenceKindRegistry.getInstance().add(extension.appPreferenceKinds),
        registries.AppPreferenceRegistry.getInstance().add(extension.appPreferences),
        registries.EntitySettingRegistry.getInstance().add(extension.entitySettings),
        registries.StatusBarRegistry.getInstance().add(extension.statusBarItems),
        registries.CommandRegistry.getInstance().add(extension.commands),
        registries.WelcomeMenuRegistry.getInstance().add(extension.welcomeMenus),
        registries.CatalogEntityDetailRegistry.getInstance().add(extension.catalogEntityDetailItems),
        registries.TopBarRegistry.getInstance().add(extension.topBarItems),
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
      if ((await extension.isEnabledForCluster(cluster)) === false) {
        return [];
      }

      const removeItems = [
        registries.ClusterPageRegistry.getInstance().add(extension.clusterPages, extension),
        registries.ClusterPageMenuRegistry.getInstance().add(extension.clusterPageMenus, extension),
        registries.KubeObjectMenuRegistry.getInstance().add(extension.kubeObjectMenuItems),
        registries.KubeObjectDetailRegistry.getInstance().add(extension.kubeObjectDetailItems),
        registries.KubeObjectStatusRegistry.getInstance().add(extension.kubeObjectStatusTexts),
        registries.WorkloadsOverviewDetailRegistry.getInstance().add(extension.kubeWorkloadsOverviewItems),
        registries.CommandRegistry.getInstance().add(extension.commands),
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

  protected autoInitExtensions(register: (ext: LensExtension) => Promise<Disposer[]>) {
    return reaction(() => this.toJSON(), installedExtensions => {
      for (const [extId, extension] of installedExtensions) {
        const alreadyInit = this.instances.has(extId) || this.nonInstancesByName.has(extension.manifest.name);

        if (extension.isCompatible && extension.isEnabled && !alreadyInit) {
          try {
            const LensExtensionClass = this.requireExtension(extension);

            if (!LensExtensionClass) {
              this.nonInstancesByName.add(extension.manifest.name);
              continue;
            }

            const instance = new LensExtensionClass(extension);

            instance.enable(register);
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
      if (ipcRenderer) {
        console.error(`${logModule}: can't load ${entryPointName} for "${extension.manifest.name}": ${error.stack || error}`, extension);
      } else {
        logger.error(`${logModule}: can't load ${entryPointName} for "${extension.manifest.name}": ${error}`, { extension });
      }
    }

    return null;
  }

  getExtension(extId: LensExtensionId): InstalledExtension {
    return this.extensions.get(extId);
  }

  getInstanceById<E extends LensExtension>(extId: LensExtensionId): E {
    return this.instances.get(extId) as E;
  }

  toJSON(): Map<LensExtensionId, InstalledExtension> {
    return toJS(this.extensions);
  }
}
