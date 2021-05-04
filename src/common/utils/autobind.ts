// Auto-binding class method(s) to proper "this"-context.
// Useful when calling methods after object-destruction or when method copied to scope variable.

type Constructor<T> = new (...args: any[]) => object;

export function autobind<T extends Constructor<any>>(target: T): T;
export function autobind<T extends object>(target: T, prop?: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor;

export function autobind(target: any, prop?: PropertyKey, descriptor?: PropertyDescriptor) {
  if (typeof target === "function") {
    return bindClass(target);
  }
  if (typeof descriptor === "object") {
    return bindMethod(target, prop, descriptor);
  }
}

export function bindClass<T extends Constructor<T>>(target: T): T {
  return new Proxy(target, {
    construct(target, args: any[], newTarget?: any) {
      const instance = Reflect.construct(target, args, newTarget);
      const protoDescriptors = Object.entries(Object.getOwnPropertyDescriptors(target.prototype));
      protoDescriptors.forEach(([prop, descriptor]) => bindMethod(instance, prop, descriptor));
      return instance;
    }
  })
}

export function bindMethod<T extends object>(target: T, prop: PropertyKey, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;

  if (typeof originalMethod === "function") {
    const boundDescriptor: PropertyDescriptor = {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      get() {
        return (...args: any[]) => Reflect.apply(originalMethod, this, args);
      },
      set(value: any) {
        Object.defineProperty(target, prop, { ...descriptor, value });
      }
    };

    Object.defineProperty(target, prop, boundDescriptor);
    return boundDescriptor;
  }
}
