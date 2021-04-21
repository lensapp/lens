/**
 * Narrowing class instances to the one.
 * Use "private" or "protected" modifier for constructor (when overriding) to disallow "new" usage.
 *
 * @example
 *  const usersStore: UsersStore = UsersStore.getInstance();
 */
type StaticThis<T, R extends any[]> = { new(...args: R): T };

export class Singleton {
  private static instances = new WeakMap<object, Singleton>();
  private static creating = "";

  constructor() {
    if (Singleton.creating.length === 0) {
      throw new TypeError("A singleton class must be created by getInstanceOrCreate()");
    }
  }

  static getInstanceOrCreate<T, R extends any[]>(this: StaticThis<T, R>, ...args: R): T {
    if (!Singleton.instances.has(this)) {
      Singleton.creating = this.name;
      Singleton.instances.set(this, new this(...args));
      Singleton.creating = "";
    }

    return Singleton.instances.get(this) as T;
  }

  static getInstance<T, R extends any[]>(this: StaticThis<T, R>, strict = true): T | undefined {
    if (!Singleton.instances.has(this) && strict) {
      throw new TypeError(`instance of ${this.name} is not created`);
    }

    return Singleton.instances.get(this) as (T | undefined);
  }

  static resetInstance() {
    Singleton.instances.delete(this);
  }
}

export default Singleton;
