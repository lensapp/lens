/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as path from "path";
import type { LensExtension } from "./lens-extension";
import type { StaticThis } from "../common/utils/singleton";
import { getOrInsertWith } from "@k8slens/utilities";
import { getLegacyGlobalDiForExtensionApi } from "@k8slens/legacy-global-di";
import type { PersistentStorage, PersistentStorageParams } from "../common/persistent-storage/create.injectable";
import createPersistentStorageInjectable from "../common/persistent-storage/create.injectable";
import directoryForUserDataInjectable from "../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import assert from "assert";
import type { Options } from "conf";
import type { Migrations } from "../common/persistent-storage/migrations.injectable";

export interface ExtensionStoreParams<T extends object> extends Omit<PersistentStorageParams<T>, "migrations" | "cwd" | "fromStore" | "toJSON"> {
  migrations?: Options<T>["migrations"];
  cwd?: string;
}

export abstract class BaseExtensionStore<T extends object> {
  private static readonly instances = new WeakMap<object, any>();

  /**
   * @deprecated This is a form of global shared state. Just call `new Store(...)`
   */
  static createInstance<T, R extends any[]>(this: StaticThis<T, R>, ...args: R): T {
    return getOrInsertWith(BaseExtensionStore.instances, this, () =>  new this(...args)) as T;
  }

  /**
   * @deprecated This is a form of global shared state. Just call `new Store(...)`
   */
  static getInstance<T, R extends any[]>(this: StaticThis<T, R>, strict?: true): T;
  static getInstance<T, R extends any[]>(this: StaticThis<T, R>, strict: false): T | undefined;
  static getInstance<T, R extends any[]>(this: StaticThis<T, R>, strict = true): T | undefined {
    if (!BaseExtensionStore.instances.has(this) && strict) {
      throw new TypeError(`instance of ${this.name} is not created`);
    }

    return BaseExtensionStore.instances.get(this) as (T | undefined);
  }

  protected persistentStorage?: PersistentStorage;
  private readonly dependencies = (() => {
    const di = getLegacyGlobalDiForExtensionApi();

    return {
      createPersistentStorage: di.inject(createPersistentStorageInjectable),
      directoryForUserData: di.inject(directoryForUserDataInjectable),
    } as const;
  })();

  constructor(protected readonly rawParams: ExtensionStoreParams<T>) { }

  /**
   * @deprecated This is a form of global shared state. Just call `new Store(...)`
   */
  static resetInstance() {
    BaseExtensionStore.instances.delete(this);
  }

  protected extension?: LensExtension;

  loadExtension(extension: LensExtension) {
    this.extension = extension;
    const {
      projectVersion = this.extension.version,
      cwd: _cwd, // This is ignored to maintain backwards compatibility
      migrations = {},
      ...params
    } = this.rawParams;

    this.persistentStorage = this.dependencies.createPersistentStorage({
      ...params,
      cwd: this.cwd(),
      projectVersion,
      migrations: migrations as Migrations,
      fromStore: (data) => this.fromStore(data),
      toJSON: () => this.toJSON(),
    });

    this.persistentStorage.loadAndStartSyncing();
  }

  /**
   * @deprecated Never use this method. Instead call {@link Common.Store.ExtensionStore.loadExtension}
   */
  load() {
    this.persistentStorage?.loadAndStartSyncing();
  }

  protected cwd() {
    assert(this.extension, "cwd can only be called in loadExtension");

    return this.rawParams.cwd ?? path.join(this.dependencies.directoryForUserData, "extension-store", this.extension.storeName);
  }

  abstract fromStore(data: Partial<T>): void;
  abstract toJSON(): T;
}
