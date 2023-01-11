/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type Config from "conf";
import type { Migrations, Options as ConfOptions } from "conf/dist/source/types";
import type { IEqualsComparer } from "mobx";
import { makeObservable, reaction } from "mobx";
import { disposer, isPromiseLike, toJS } from "../utils";
import { broadcastMessage } from "../ipc";
import isEqual from "lodash/isEqual";
import { kebabCase } from "lodash";
import type { GetConfigurationFileModel } from "../get-configuration-file-model/get-configuration-file-model.injectable";
import type { Logger } from "../logger";
import type { PersistStateToConfig } from "./save-to-file";
import type { GetBasenameOfPath } from "../path/get-basename.injectable";
import type { EnlistMessageChannelListener } from "../utils/channel/enlist-message-channel-listener-injection-token";

export interface BaseStoreParams<T> extends Omit<ConfOptions<T>, "migrations"> {
  syncOptions?: {
    fireImmediately?: boolean;
    equals?: IEqualsComparer<T>;
  };
  configName: string;
}

export interface IpcChannelPrefixes {
  local: string;
  remote: string;
}

export interface BaseStoreDependencies {
  readonly logger: Logger;
  readonly storeMigrationVersion: string;
  readonly directoryForUserData: string;
  readonly migrations: Migrations<Record<string, unknown>>;
  readonly ipcChannelPrefixes: IpcChannelPrefixes;
  readonly shouldDisableSyncInListener: boolean;
  getConfigurationFileModel: GetConfigurationFileModel;
  persistStateToConfig: PersistStateToConfig;
  getBasenameOfPath: GetBasenameOfPath;
  enlistMessageChannelListener: EnlistMessageChannelListener;
}

/**
 * Note: T should only contain base JSON serializable types.
 */
export abstract class BaseStore<T extends object> {
  private readonly syncDisposers = disposer();

  readonly displayName = kebabCase(this.params.configName).toUpperCase();

  protected constructor(
    protected readonly dependencies: BaseStoreDependencies,
    protected readonly params: BaseStoreParams<T>,
  ) {
    makeObservable(this);
  }

  /**
   * This must be called after the last child's constructor is finished (or just before it finishes)
   */
  load() {
    this.dependencies.logger.info(`[${this.displayName}]: LOADING ...`);

    const config = this.dependencies.getConfigurationFileModel({
      projectName: "lens",
      projectVersion: this.dependencies.storeMigrationVersion,
      cwd: this.cwd(),
      ...this.params,
      migrations: this.dependencies.migrations as Migrations<T>,
    });

    const res = this.fromStore(config.store);

    if (isPromiseLike(res)) {
      this.dependencies.logger.error(`${this.displayName} extends BaseStore<T>'s fromStore method returns a Promise or promise-like object. This is an error and must be fixed.`);
    }

    this.startSyncing(config);
    this.dependencies.logger.info(`[${this.displayName}]: LOADED from ${config.path}`);
  }

  protected cwd() {
    return this.dependencies.directoryForUserData;
  }

  private startSyncing(config: Config<T>) {
    const name = this.dependencies.getBasenameOfPath(config.path);

    const disableSync = () => this.syncDisposers();
    const enableSync = () => {
      this.syncDisposers.push(
        reaction(
          () => toJS(this.toJSON()), // unwrap possible observables and react to everything
          model => {
            this.dependencies.persistStateToConfig(config, model);
            broadcastMessage(`${this.dependencies.ipcChannelPrefixes.remote}:${config.path}`, model);
          },
          this.params.syncOptions,
        ),
        this.dependencies.enlistMessageChannelListener({
          channel: {
            id: `${this.dependencies.ipcChannelPrefixes.local}:${config.path}`,
          },
          handler: (model) => {
            this.dependencies.logger.silly(`[${this.displayName}]: syncing ${name}`, { model });

            if (this.dependencies.shouldDisableSyncInListener) {
              disableSync();
            }

            // todo: use "resourceVersion" if merge required (to avoid equality checks => better performance)
            if (!isEqual(this.toJSON(), model)) {
              this.fromStore(model as T);
            }

            if (this.dependencies.shouldDisableSyncInListener) {
              enableSync();
            }
          },
        }),
      );
    };

    enableSync();
  }

  /**
   * fromStore is called internally when a child class syncs with the file
   * system.
   *
   * Note: This function **must** be synchronous.
   *
   * @param data the parsed information read from the stored JSON file
   */
  protected abstract fromStore(data: T): void;

  /**
   * toJSON is called when syncing the store to the filesystem. It should
   * produce a JSON serializable object representation of the current state.
   *
   * It is recommended that a round trip is valid. Namely, calling
   * `this.fromStore(this.toJSON())` shouldn't change the state.
   */
  abstract toJSON(): T;
}
