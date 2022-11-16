/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BaseStore } from "../common/base-store";
import * as path from "path";
import type { LensExtension } from "./lens-extension";
import assert from "assert";
import type { StaticThis } from "../common/utils";
import { getOrInsertWith } from "../common/utils";

export abstract class ExtensionStore<T extends object> extends BaseStore<T> {
  private static readonly instances = new WeakMap<object, ExtensionStore<object>>();

  /**
   * @deprecated This is a form of global shared state. Just call `new Store(...)`
   */
  static createInstance<T extends ExtensionStore<object>, R extends any[]>(this: StaticThis<T, R>, ...args: R): T {
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

  /**
   * @deprecated This is a form of global shared state. Just call `new Store(...)`
   */
  static resetInstance() {
    ExtensionStore.instances.delete(this);
  }

  readonly displayName = "ExtensionStore<T>";
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
