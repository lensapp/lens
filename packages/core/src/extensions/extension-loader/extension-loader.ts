/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ipcMain, ipcRenderer } from "electron";
import { isEqual } from "lodash";
import type { ObservableMap } from "mobx";
import { runInAction, action, computed, toJS, observable, reaction, when } from "mobx";
import { broadcastMessage, ipcMainOn, ipcRendererOn, ipcMainHandle } from "../../common/ipc";
import { isDefined, iter } from "@k8slens/utilities";
import type { ExternalInstalledExtension, InstalledExtension, LensExtensionConstructor, LensExtensionId, BundledExtension, BundledInstalledExtension, LegacyLensExtension } from "@k8slens/legacy-extensions";
import type { LensExtension } from "../lens-extension";
import { extensionLoaderFromMainChannel, extensionLoaderFromRendererChannel } from "../../common/ipc/extension-handling";
import { requestExtensionLoaderInitialState } from "../../renderer/ipc";
import assert from "assert";
import { EventEmitter } from "@k8slens/event-emitter";
import type { Extension } from "./extension/extension.injectable";
import type { Logger } from "@k8slens/logger";
import type { JoinPaths } from "../../common/path/join-paths.injectable";
import type { GetDirnameOfPath } from "../../common/path/get-dirname.injectable";
import type { UpdateExtensionsState } from "../../features/extensions/enabled/common/update-state.injectable";

const logModule = "[EXTENSIONS-LOADER]";

interface Dependencies {
  readonly extensionInstances: ObservableMap<LensExtensionId, LegacyLensExtension>;
  readonly bundledExtensions: BundledExtension[];
  readonly logger: Logger;
  readonly extensionEntryPointName: "main" | "renderer";
  updateExtensionsState: UpdateExtensionsState;
  getExtension: (instance: LegacyLensExtension) => Extension;
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

  protected readonly instancesByName = computed(() => new Map((
    iter.chain(this.dependencies.extensionInstances.entries())
      .map(([, instance]) => [instance.name, instance])
  )));

  private readonly onRemoveExtensionId = new EventEmitter<[string]>();

  readonly isLoaded = observable.box(false);

  constructor(protected readonly dependencies: Dependencies) {}

  readonly userExtensions = computed(() => new Map((
    this.extensions.toJSON()
      .filter(([, extension]) => !extension.isBundled)
  )));

  /**
   * Get the extension instance by its manifest name
   * @param name The name of the extension
   * @returns one of the following:
   * - the instance of `Main.LensExtension` on the main process if created
   * - the instance of `Renderer.LensExtension` on the renderer process if created
   * - `null` if no class definition is provided for the current process
   * - `undefined` if the name is not known about
   */
  getInstanceByName(name: string): LegacyLensExtension | null | undefined {
    if (this.nonInstancesByName.has(name)) {
      return null;
    }

    return this.instancesByName.get().get(name);
  }

  // Transform userExtensions to a state object for storing into ExtensionsStore
  readonly storeState = computed(() => Array.from(
    this.userExtensions.get(),
    ([extId, extension]) => [extId, {
      enabled: extension.isEnabled,
      name: extension.manifest.name,
    }] as const,
  ));

  async init() {
    if (ipcMain) {
      await this.initMain();
    } else {
      await this.initRenderer();
    }

    await when(() => this.isLoaded.get());

    // broadcasting extensions between main/renderer processes
    reaction(() => this.toJSON(), () => this.broadcastExtensions(), {
      fireImmediately: true,
    });

    reaction(
      () => this.storeState.get(),
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

    assert(extension, `Extension "${lensExtensionId}" must be registered before it can be enabled.`);
    assert(!extension.isBundled, `Cannot change the enabled state of a bundled extension`);

    extension.isEnabled = isEnabled;
  }

  protected async initMain() {
    runInAction(() => {
      this.isLoaded.set(true);
    });

    await this.autoInitExtensions();

    ipcMainHandle(extensionLoaderFromMainChannel, () => [...this.toJSON()]);

    ipcMainOn(extensionLoaderFromRendererChannel, (event, extensions: [LensExtensionId, InstalledExtension][]) => {
      this.syncExtensions(extensions);
    });
  }

  protected async initRenderer() {
    const extensionListHandler = (extensions: [LensExtensionId, InstalledExtension][]) => {
      runInAction(() => {
        this.isLoaded.set(true);
      });
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
    const bundledExtensions = await Promise.all((this.dependencies.bundledExtensions
      .map(async extension => {
        try {
          const LensExtensionClass = await extension[this.dependencies.extensionEntryPointName]();

          if (!LensExtensionClass) {
            return null;
          }

          const installedExtension: BundledInstalledExtension = {
            absolutePath: "irrelevant",
            id: extension.manifest.name,
            isBundled: true,
            isCompatible: true,
            isEnabled: true,
            manifest: extension.manifest,
            manifestPath: "irrelevant",
          };
          const instance = new LensExtensionClass(installedExtension);

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
    ));

    return bundledExtensions.filter(isDefined);
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
      .filter((entry): entry is [string, ExternalInstalledExtension] => !entry[1].isBundled)
      .map(([extId, installedExtension]) => {
        const alreadyInit = this.dependencies.extensionInstances.has(extId) || this.nonInstancesByName.has(installedExtension.manifest.name);

        if (installedExtension.isCompatible && installedExtension.isEnabled && !alreadyInit) {
          try {
            const LensExtensionClass = this.requireExtension(installedExtension);

            if (!LensExtensionClass) {
              this.nonInstancesByName.add(installedExtension.manifest.name);

              return null;
            }

            const instance = new LensExtensionClass(installedExtension);

            this.dependencies.extensionInstances.set(extId, instance);

            return {
              instance,
              installedExtension,
              activated: instance.activate(),
            } as ExtensionBeingActivated;
          } catch (err) {
            this.dependencies.logger.error(`${logModule}: error loading extension`, { ext: installedExtension, err });
          }
        } else if (!installedExtension.isEnabled && alreadyInit) {
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

  protected requireExtension(extension: ExternalInstalledExtension): LensExtensionConstructor | null {
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

  getExtensionById(extId: LensExtensionId) {
    return this.extensions.get(extId);
  }

  getInstanceById(extId: LensExtensionId) {
    return this.dependencies.extensionInstances.get(extId);
  }

  toJSON(): Map<LensExtensionId, InstalledExtension> {
    return toJS(this.extensions);
  }
}
