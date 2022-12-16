/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { BaseStoreParams } from "../common/base-store/base-store";
import { BaseStore } from "../common/base-store/base-store";
import * as path from "path";
import type { LensExtension } from "./lens-extension";
import assert from "assert";
import type { StaticThis } from "../common/utils";
import { getOrInsertWith } from "../common/utils";
import { getLegacyGlobalDiForExtensionApi } from "./as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import directoryForUserDataInjectable from "../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../common/get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../common/logger.injectable";
import storeMigrationVersionInjectable from "../common/vars/store-migration-version.injectable";
import type { Migrations } from "conf/dist/source/types";
import { baseStoreIpcChannelPrefixesInjectionToken } from "../common/base-store/channel-prefix";
import { shouldBaseStoreDisableSyncInIpcListenerInjectionToken } from "../common/base-store/disable-sync";
import { persistStateToConfigInjectionToken } from "../common/base-store/save-to-file";
import getBasenameOfPathInjectable from "../common/path/get-basename.injectable";
import { enlistMessageChannelListenerInjectionToken } from "../common/utils/channel/enlist-message-channel-listener-injection-token";

export interface ExtensionStoreParams<T extends object> extends BaseStoreParams<T> {
  migrations?: Migrations<T>;
}

export abstract class ExtensionStore<T extends object> extends BaseStore<T> {
  private static readonly instances = new WeakMap<object, any>();

  /**
   * @deprecated This is a form of global shared state. Just call `new Store(...)`
   */
  static createInstance<T, R extends any[]>(this: StaticThis<T, R>, ...args: R): T {
    return getOrInsertWith(ExtensionStore.instances, this, () =>  new this(...args)) as T;
  }

  /**
   * @deprecated This is a form of global shared state. Just call `new Store(...)`
   */
  static getInstance<T, R extends any[]>(this: StaticThis<T, R>, strict?: true): T;
  static getInstance<T, R extends any[]>(this: StaticThis<T, R>, strict: false): T | undefined;
  static getInstance<T, R extends any[]>(this: StaticThis<T, R>, strict = true): T | undefined {
    if (!ExtensionStore.instances.has(this) && strict) {
      throw new TypeError(`instance of ${this.name} is not created`);
    }

    return ExtensionStore.instances.get(this) as (T | undefined);
  }

  constructor({ migrations, ...params }: ExtensionStoreParams<T>) {
    const di = getLegacyGlobalDiForExtensionApi();

    super({
      directoryForUserData: di.inject(directoryForUserDataInjectable),
      getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
      logger: di.inject(loggerInjectable),
      storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
      migrations: migrations as Migrations<Record<string, unknown>>,
      getBasenameOfPath: di.inject(getBasenameOfPathInjectable),
      ipcChannelPrefixes: di.inject(baseStoreIpcChannelPrefixesInjectionToken),
      persistStateToConfig: di.inject(persistStateToConfigInjectionToken),
      enlistMessageChannelListener: di.inject(enlistMessageChannelListenerInjectionToken),
      shouldDisableSyncInListener: di.inject(shouldBaseStoreDisableSyncInIpcListenerInjectionToken),
    }, params);
  }

  /**
   * @deprecated This is a form of global shared state. Just call `new Store(...)`
   */
  static resetInstance() {
    ExtensionStore.instances.delete(this);
  }

  protected extension?: LensExtension;

  loadExtension(extension: LensExtension) {
    this.extension = extension;

    this.params.projectVersion ??= this.extension.version;

    return super.load();
  }

  load() {
    if (!this.extension) { return; }

    return super.load();
  }

  protected cwd() {
    assert(this.extension, "must call this.load() first");

    return path.join(super.cwd(), "extension-store", this.extension.name);
  }
}
