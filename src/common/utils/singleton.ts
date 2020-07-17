/**
 * Narrowing class instances to the one.
 * Use "private" or "protected" modifier for constructor (when overriding) to disallow "new" usage.
 *
 * @example
 *  const usersStore: UsersStore = UsersStore.getInstance();
 */

type Constructor<T = {}> = new (...args: any[]) => T;

class Singleton {
  private static instances = new WeakMap<object, Singleton>();

  // todo: improve types inferring
  static getInstance<T>(...args: ConstructorParameters<Constructor<T>>): T {
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