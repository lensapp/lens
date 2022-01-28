/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BaseStore } from "../common/base-store";
import * as path from "path";
import type { LensExtension } from "./lens-extension";

type StaticThis<T, R extends any[]> = { new(...args: R): T };

export abstract class ExtensionStore<T> extends BaseStore<T> {
  private static instances = new WeakMap<object, ExtensionStore<any>>();
  private static creating = "";

  /**
   * @deprecated You can and should just create the instance of the store yourself
   * Creates the single instance of the child class if one was not already created.
   *
   * Multiple calls will return the same instance.
   * Essentially throwing away the arguments to the subsequent calls.
   *
   * Note: this is a racy function, if two (or more) calls are racing to call this function
   * only the first's arguments will be used.
   * @param this Implicit argument that is the child class type
   * @param args The constructor arguments for the child class
   * @returns An instance of the child class
   */
  static createInstance<T, R extends any[]>(this: StaticThis<T, R>, ...args: R): T {
    if (!ExtensionStore.instances.has(this)) {
      if (ExtensionStore.creating.length > 0) {
        throw new TypeError(`Cannot create a second ExtensionStore (${this.name}) while creating a first (${ExtensionStore.creating})`);
      }

      try {
        ExtensionStore.creating = this.name;
        ExtensionStore.instances.set(this, new this(...args) as any);
      } finally {
        ExtensionStore.creating = "";
      }
    }

    return ExtensionStore.instances.get(this) as any;
  }

  /**
   * @deprecated You can and should just get the instance of the store yourself
   * Get the instance of the child class that was previously created.
   * @param this Implicit argument that is the child class type
   * @param strict If false will return `undefined` instead of throwing when an instance doesn't exist.
   * Default: `true`
   * @returns An instance of the child class
   */
  static getInstance<T, R extends any[]>(this: StaticThis<T, R>, strict = true): T | undefined {
    if (!ExtensionStore.instances.has(this) && strict) {
      throw new TypeError(`instance of ${this.name} is not created`);
    }

    return ExtensionStore.instances.get(this) as any;
  }

  /**
   * @deprecated This function shouldn't really be used
   * Delete the instance of the child class.
   *
   * Note: this doesn't prevent callers of `getInstance` from storing the result in a global.
   *
   * There is *no* way in JS or TS to prevent globals like that.
   */
  static resetInstance() {
    ExtensionStore.instances.delete(this);
  }

  readonly displayName = "ExtensionStore<T>";
  protected extension: LensExtension;

  loadExtension(extension: LensExtension) {
    this.extension = extension;

    return super.load();
  }

  load() {
    if (!this.extension) { return; }

    return super.load();
  }

  protected cwd() {
    return path.join(super.cwd(), "extension-store", this.extension.name);
  }
}
