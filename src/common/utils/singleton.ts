/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

interface StaticThis<T, R extends any[]> { new(...args: R): T }

export class Singleton {
  private static instances = new WeakMap<object, Singleton>();
  private static creating = "";

  constructor() {
    if (Singleton.creating.length === 0) {
      throw new TypeError("A singleton class must be created by createInstance()");
    }
  }

  /**
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
    if (!Singleton.instances.has(this)) {
      if (Singleton.creating.length > 0) {
        throw new TypeError(`Cannot create a second singleton (${this.name}) while creating a first (${Singleton.creating})`);
      }

      try {
        Singleton.creating = this.name;
        Singleton.instances.set(this, new this(...args));
      } finally {
        Singleton.creating = "";
      }
    }

    return Singleton.instances.get(this) as T;
  }

  /**
   * Get the instance of the child class that was previously created.
   * @param this Implicit argument that is the child class type
   * @param strict If false will return `undefined` instead of throwing when an instance doesn't exist.
   * Default: `true`
   * @returns An instance of the child class
   */
  static getInstance<T, R extends any[]>(this: StaticThis<T, R>, strict?: true): T;
  static getInstance<T, R extends any[]>(this: StaticThis<T, R>, strict: false): T | undefined;
  static getInstance<T, R extends any[]>(this: StaticThis<T, R>, strict = true): T | undefined {
    if (!Singleton.instances.has(this) && strict) {
      throw new TypeError(`instance of ${this.name} is not created`);
    }

    return Singleton.instances.get(this) as (T | undefined);
  }

  /**
   * Delete the instance of the child class.
   *
   * Note: this doesn't prevent callers of `getInstance` from storing the result in a global.
   *
   * There is *no* way in JS or TS to prevent globals like that.
   */
  static resetInstance() {
    Singleton.instances.delete(this);
  }
}

export default Singleton;
