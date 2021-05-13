/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Decorator for binding class methods
// Can be applied to class or single method as @autobind()
type Constructor<T = {}> = new (...args: any[]) => T;

export function autobind() {
  return function (target: Constructor | object, prop?: string, descriptor?: PropertyDescriptor) {
    if (target instanceof Function) return bindClass(target);
    else return bindMethod(target, prop, descriptor);
  };
}

function bindClass<T extends Constructor>(constructor: T) {
  const proto = constructor.prototype;
  const descriptors = Object.getOwnPropertyDescriptors(proto);
  const skipMethod = (methodName: string) => {
    return methodName === "constructor"
      || typeof descriptors[methodName].value !== "function";
  };

  Object.keys(descriptors).forEach(prop => {
    if (skipMethod(prop)) return;
    const boundDescriptor = bindMethod(proto, prop, descriptors[prop]);

    Object.defineProperty(proto, prop, boundDescriptor);
  });
}

function bindMethod(target: object, prop?: string, descriptor?: PropertyDescriptor) {
  if (!descriptor || typeof descriptor.value !== "function") {
    throw new Error(`@autobind() must be used on class or method only`);
  }
  const { value: func, enumerable, configurable } = descriptor;
  const boundFunc = new WeakMap<object, Function>();

  return Object.defineProperty(target, prop, {
    enumerable,
    configurable,
    get() {
      if (this === target) return func; // direct access from prototype
      if (!boundFunc.has(this)) boundFunc.set(this, func.bind(this));

      return boundFunc.get(this);
    }
  });
}
