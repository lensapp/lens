/**
 * Narrowing class instances to the one.
 * Use "private" or "protected" modifier for constructor (when overriding) to disallow "new" usage.
 *
 * @example
 *  const usersStore: UsersStore = UsersStore.getInstance();
 */

// todo: maybe convert to @decorator
class Singleton {
  private static instances = new WeakMap<object, Singleton>();

  // todo: figure out how to infer child class + arguments types
  static getInstance<T extends Singleton>(...args: any[]): T {
    if (!Singleton.instances.has(this)) {
      Singleton.instances.set(this, Reflect.construct(this, args));
    }
    return Singleton.instances.get(this) as T;
  }

  static resetInstance() {
    Singleton.instances.delete(this);
  }
}

export { Singleton }
export default Singleton;