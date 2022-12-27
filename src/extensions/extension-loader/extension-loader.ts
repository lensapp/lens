/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ipcMain, ipcRenderer } from "electron";
import { isEqual } from "lodash";
import type { ObservableMap } from "mobx";
import { action, computed, makeObservable, observable, observe, reaction, when } from "mobx";
import { broadcastMessage, ipcMainOn, ipcRendererOn, ipcMainHandle } from "../../common/ipc";
import { isDefined, toJS } from "../../common/utils";
import type { InstalledExtension } from "../extension-discovery/extension-discovery";
import type { LensExtension, LensExtensionConstructor, LensExtensionId } from "../lens-extension";
import type { LensExtensionState } from "../extensions-store/extensions-store";
import { extensionLoaderFromMainChannel, extensionLoaderFromRendererChannel } from "../../common/ipc/extension-handling";
import { requestExtensionLoaderInitialState } from "../../renderer/ipc";
import assert from "assert";
import { EventEmitter } from "../../common/event-emitter";
import type { CreateExtensionInstance } from "./create-extension-instance.token";
import type { Extension } from "./extension/extension.injectable";
import type { Logger } from "../../common/logger";
import type { JoinPaths } from "../../common/path/join-paths.injectable";
import type { GetDirnameOfPath } from "../../common/path/get-dirname.injectable";
import type { BundledExtension } from "../extension-discovery/bundled-extension-token";

const logModule = "[EXTENSIONS-LOADER]";

interface Dependencies {
  readonly extensionInstances: ObservableMap<LensExtensionId, LensExtension>;
  readonly bundledExtensions: BundledExtension[];
  readonly logger: Logger;
  readonly extensionEntryPointName: "main" | "renderer";
  updateExtensionsState: (extensionsState: Record<LensExtensionId, LensExtensionState>) => void;
  createExtensionInstance: CreateExtensionInstance;
  getExtension: (instance: LensExtension) => Extension;
  joinPaths: JoinPaths;
  getDirnameOfPath: GetDirnameOfPath;
}

interface ExtensionBeingActivated {
  instance: LensExtension;
  installedExtension: InstalledExtension;
  activated: Promise<void>;
}

export interface ExtensionLoading {
  isBundled: boolean;
  loaded: Promise<void>;
}

/**
 * Loads installed extensions to the Lens application
 */
export class ExtensionLoader {
  protected readonly extensions = observable.map<LensExtensionId, InstalledExtension>();

  /**
   * This is the set of extensions that don't come with either
   * - Main.LensExtension when running in the main process
   * - Renderer.LensExtension when running in the renderer process
   */
  protected readonly nonInstancesByName = observable.set<string>();

  /**
   * This is updated by the `observe` in the constructor. DO NOT write directly to it
   */
  protected readonly instancesByName = observable.map<string, LensExtension>();

  private readonly onRemoveExtensionId = new EventEmitter<[string]>();

  @observable isLoaded = false;

  get whenLoaded() {
    return when(() => this.isLoaded);
  }

  constructor(protected readonly dependencies: Dependencies) {
    makeObservable(this);

    observe(this.dependencies.extensionInstances, change => {
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
        }]),
    );
  }

  @action
  async init() {
    if (ipcMain) {
      await this.initMain();
    } else {
      await this.initRenderer();
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
    this.dependencies.logger.info(`${logModule} deleting extension instance ${lensExtensionId}`);
    const instance = this.dependencies.extensionInstances.get(lensExtensionId);

    if (!instance) {
      return;
    }

    try {
      instance.disable();

      const extension = this.dependencies.getExtension(instance);

      extension.deregister();

      this.onRemoveExtensionId.emit(instance.id);
      this.dependencies.extensionInstances.delete(lensExtensionId);
      this.nonInstancesByName.delete(instance.name);
    } catch (error) {
      this.dependencies.logger.error(`${logModule}: deactivation extension error`, { lensExtensionId, error });
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
    await this.autoInitExtensions();

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

  protected async loadBundledExtensions() {
    return this.dependencies.bundledExtensions
      .map(extension => {
        try {
          const LensExtensionClass = extension[this.dependencies.extensionEntryPointName]();

          if (!LensExtensionClass) {
            return null;
          }

          const installedExtension: InstalledExtension = {
            absolutePath: "irrelevant",
            id: extension.manifest.name,
            isBundled: true,
            isCompatible: true,
            isEnabled: true,
            manifest: extension.manifest,
            manifestPath: "irrelevant",
          };
          const instance = this.dependencies.createExtensionInstance(
            LensExtensionClass,
            installedExtension,
          );

          this.dependencies.extensionInstances.set(extension.manifest.name, instance);

          return {
            instance,
            installedExtension,
            activated: instance.activate(),
          } as ExtensionBeingActivated;
        } catch (err) {
          this.dependencies.logger.error(`${logModule}: error loading extension`, { ext: extension, err });

          return null;
        }
      })
      .filter(isDefined);
  }

  protected async loadExtensions(extensions: ExtensionBeingActivated[]): Promise<ExtensionLoading[]> {
    // We first need to wait until each extension's `onActivate` is resolved or rejected,
    // as this might register new catalog categories. Afterwards we can safely .enable the extension.
    await Promise.all(
      extensions.map(extension =>
        // If extension activation fails, log error
        extension.activated.catch((error) => {
          this.dependencies.logger.error(`${logModule}: activation extension error`, { ext: extension.installedExtension, error });
        }),
      ),
    );

    extensions.forEach(({ instance }) => {
      const extension = this.dependencies.getExtension(instance);

      extension.register();
    });

    return extensions.map(extension => {
      const loaded = extension.instance.enable().catch((err) => {
        this.dependencies.logger.error(`${logModule}: failed to enable`, { ext: extension, err });
      });

      return {
        isBundled: extension.installedExtension.isBundled,
        loaded,
      };
    });
  }

  protected async loadUserExtensions(installedExtensions: Map<string, InstalledExtension>) {
    // Steps of the function:
    // 1. require and call .activate for each Extension
    // 2. Wait until every extension's onActivate has been resolved
    // 3. Call .enable for each extension
    // 4. Return ExtensionLoading[]

    return [...installedExtensions.entries()]
      .map(([extId, extension]) => {
        const alreadyInit = this.dependencies.extensionInstances.has(extId) || this.nonInstancesByName.has(extension.manifest.name);

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

            this.dependencies.extensionInstances.set(extId, instance);

            return {
              instance,
              installedExtension: extension,
              activated: instance.activate(),
            } as ExtensionBeingActivated;
          } catch (err) {
            this.dependencies.logger.error(`${logModule}: error loading extension`, { ext: extension, err });
          }
        } else if (!extension.isEnabled && alreadyInit) {
          this.removeInstance(extId);
        }

        return null;
      })
      .filter(isDefined);
  }

  async autoInitExtensions() {
    this.dependencies.logger.info(`${logModule}: auto initializing extensions`);

    const bundledExtensions = await this.loadBundledExtensions();
    const userExtensions = await this.loadUserExtensions(this.toJSON());
    const loadedExtensions = await this.loadExtensions([
      ...bundledExtensions,
      ...userExtensions,
    ]);

    // Setup reaction to load extensions on JSON changes
    reaction(() => this.toJSON(), installedExtensions => {
      void (async () => {
        const userExtensions = await this.loadUserExtensions(installedExtensions);

        await this.loadExtensions(userExtensions);
      })();
    });

    return loadedExtensions;
  }

  protected requireExtension(extension: InstalledExtension): LensExtensionConstructor | null {
    const extRelativePath = extension.manifest[this.dependencies.extensionEntryPointName];

    if (!extRelativePath) {
      return null;
    }

    const extAbsolutePath = this.dependencies.joinPaths(this.dependencies.getDirnameOfPath(extension.manifestPath), extRelativePath);

    try {
      return require(/* webpackIgnore: true */ extAbsolutePath).default;
    } catch (error) {
      const message = (error instanceof Error ? error.stack : undefined) || error;

      this.dependencies.logger.error(`${logModule}: can't load ${this.dependencies.extensionEntryPointName} for "${extension.manifest.name}": ${message}`, { extension });
    }

    return null;
  }

  getExtension(extId: LensExtensionId) {
    return this.extensions.get(extId);
  }

  getInstanceById(extId: LensExtensionId) {
    return this.dependencies.extensionInstances.get(extId);
  }

  toJSON(): Map<LensExtensionId, InstalledExtension> {
    return toJS(this.extensions);
  }
}
