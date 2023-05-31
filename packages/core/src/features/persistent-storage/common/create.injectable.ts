/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { disposer, isPromiseLike } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import type { Options } from "conf/dist/source";
import { isEqual, kebabCase } from "lodash";
import type { IEqualsComparer } from "mobx";
import { reaction } from "mobx";
import { loggerInjectionToken } from "@k8slens/logger";
import { enlistMessageChannelListenerInjectionToken, sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import type { MessageChannel } from "@k8slens/messaging";
import { persistentStorageIpcChannelPrefixesInjectionToken } from "./channel-prefix";
import { shouldPersistentStorageDisableSyncInIpcListenerInjectionToken } from "./disable-sync";
import { persistStateToConfigInjectionToken } from "./save-to-file";
import type { Migrations } from "./migrations.injectable";
import { nextTick } from "process";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import getBasenameOfPathInjectable from "../../../common/path/get-basename.injectable";

export interface PersistentStorage {
  /**
   * This method does the initial synchronous load from disk and then starts writing the state
   * back to disk whenever it changes.
   */
  loadAndStartSyncing: () => void;
}

export interface PersistentStorageParams<T extends object> extends Omit<Options<T>, "migrations"> {
  readonly syncOptions?: {
    readonly fireImmediately?: boolean;
    equals?: IEqualsComparer<T>;
  };
  readonly configName: string;
  readonly migrations?: Migrations;

  /**
   * fromStore is called internally when a child class syncs with the file
   * system.
   *
   * Note: This function **must** be synchronous.
   *
   * @param data the parsed information read from the stored JSON file
   */
  fromStore(data: Partial<T>): void;

  /**
   * toJSON is called when syncing the store to the filesystem. It should
   * produce a JSON serializable object representation of the current state.
   *
   * It is recommended that a round trip is valid. Namely, calling
   * `this.fromStore(this.toJSON())` shouldn't change the state.
   */
  toJSON(): T;
}

export type CreatePersistentStorage = <T extends object>(params: PersistentStorageParams<T>) => PersistentStorage;

const createPersistentStorageInjectable = getInjectable({
  id: "create-persistent-storage",
  instantiate: (di): CreatePersistentStorage => {
    const directoryForUserData = di.inject(directoryForUserDataInjectable);
    const getConfigurationFileModel = di.inject(getConfigurationFileModelInjectable);
    const logger = di.inject(loggerInjectionToken);
    const getBasenameOfPath = di.inject(getBasenameOfPathInjectable);
    const ipcChannelPrefixes = di.inject(persistentStorageIpcChannelPrefixesInjectionToken);
    const persistStateToConfig = di.inject(persistStateToConfigInjectionToken);
    const enlistMessageChannelListener = di.inject(enlistMessageChannelListenerInjectionToken);
    const shouldDisableSyncInListener = di.inject(shouldPersistentStorageDisableSyncInIpcListenerInjectionToken);
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return <T extends object>(rawParams: PersistentStorageParams<T>) => {
      const {
        fromStore,
        toJSON,
        syncOptions,
        migrations,
        cwd = directoryForUserData,
        ...params
      } = rawParams;
      const displayName = kebabCase(params.configName).toUpperCase();

      const loadAndStartSyncing = () => {
        logger.info(`[${displayName}]: LOADING ...`);

        const config = getConfigurationFileModel({
          projectName: "lens",
          cwd,
          migrations: migrations as Options<T>["migrations"],
          ...params,
        });

        const res = fromStore(config.store);

        if (isPromiseLike(res)) {
          logger.error(`${displayName} extends BaseStore<T>'s fromStore method returns a Promise or promise-like object. This is an error and must be fixed.`);
        }

        logger.info(`[${displayName}]: LOADED from ${config.path}`);

        const syncDisposers = disposer();
        const sendChannel: MessageChannel<T> = {
          id: `${ipcChannelPrefixes.remote}:${config.path}`,
        };
        const receiveChannel: MessageChannel<T> = {
          id: `${ipcChannelPrefixes.local}:${config.path}`,
        };
        const name = getBasenameOfPath(config.path);

        const disableSync = () => syncDisposers();
        const enableSync = () => {
          syncDisposers.push(
            reaction(
              () => toJSON(),
              model => {
                persistStateToConfig(config, model);
                sendMessageToChannel(sendChannel, model);
              },
              syncOptions,
            ),
            enlistMessageChannelListener({
              id: "persistent-storage-sync",
              channel: receiveChannel,
              handler: (model) => {
                logger.silly(`[${displayName}]: syncing ${name}`, { model });

                if (shouldDisableSyncInListener) {
                  disableSync();
                }

                // todo: use "resourceVersion" if merge required (to avoid equality checks => better performance)
                if (!isEqual(toJSON(), model)) {
                  fromStore(model);
                }

                if (shouldDisableSyncInListener) {
                  nextTick(() => {
                    enableSync();
                  });
                }
              },
            }),
          );
        };

        enableSync();
      };

      return {
        loadAndStartSyncing,
      };
    };
  },
});

export default createPersistentStorageInjectable;
