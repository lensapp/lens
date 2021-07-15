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


type StaticThis<T, R extends any[]> = { new(...args: R): T };

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

export interface DeclareOpts {
  requires?: Iterable<typeof Singleton>,
}

type Initializer<T> = (instance: T) => void;

interface CreateRequirements {
  builds: typeof Singleton,
  args?: ConstructorParameters<typeof Singleton> | (() => ConstructorParameters<typeof Singleton>),
  requires?: Set<typeof Singleton>,
  init?: (single: Singleton) => Promise<void>;
}

/**
 * A builder class for declaring the dependency graph of a set of singletons
 *
 * This is useful because it allows the code to declare the requirements
 */
export class CreateSingletons {
  #requirements: CreateRequirements[] = [];

  private constructor() {
    //
  }

  static begin(): CreateSingletons {
    return new CreateSingletons();
  }

  /**
   * Add a Singleton that requires no arguments to build
   * @param builds The constructor which must be a type that extends Singleton
   * @param opts The optional singletons that must be required before this can be created
   * @returns the builder
   */
  declare<T>(builds: StaticThis<T, []>, opts?: DeclareOpts): this;
  declare<T>(builds: StaticThis<T, []>, init?: Initializer<T>, opts?: DeclareOpts): this;
  declare<T>(builds: StaticThis<T, []>, initOrOpts?: Initializer<T> | DeclareOpts, opts?: DeclareOpts): this {
    if (typeof initOrOpts === "function") {
      const { requires } = opts ?? {};

      this.#requirements.push({
        builds: builds as any,
        requires: new Set(requires),
        init: initOrOpts as any,
      });
    } else {
      const { requires } = initOrOpts ?? {};

      this.#requirements.push({
        builds: builds as any,
        requires: new Set(requires),
      });
    }

    return this;
  }

  /**
   * Like `declare` but with the ability to pass in arguments for the constructor
   */
  declareWithArgs<T, R extends any[]>(builds: StaticThis<T, R>, args: R | (() => R), opts?: DeclareOpts): this;
  declareWithArgs<T, R extends any[]>(builds: StaticThis<T, R>, args: R | (() => R), init?: Initializer<T>, opts?: DeclareOpts): this;
  declareWithArgs<T, R extends any[]>(builds: StaticThis<T, R>, args: R | (() => R), initOrOpts?: Initializer<T> | DeclareOpts, opts?: DeclareOpts): this {
    if (typeof initOrOpts === "function") {
      const { requires } = opts ?? {};

      this.#requirements.push({
        builds: builds as any,
        args: args as any,
        requires: new Set(requires),
        init: initOrOpts as any,
      });
    } else {
      const { requires } = initOrOpts ?? {};

      this.#requirements.push({
        builds: builds as any,
        args: args as any,
        requires: new Set(requires),
      });
    }

    return this;
  }

  buildAll(): void {
    while (this.#requirements.length > 0) {
      const nextSatisfiedIndex = this.#requirements.findIndex(creation => creation.requires.size === 0);

      if (nextSatisfiedIndex < 0) {
        throw new Error("Circular dependency for Singleton creation");
      }

      const [{ builds, args, init }] = this.#requirements.splice(nextSatisfiedIndex, 1);

      if (builds.createInstance !== Singleton.createInstance) {
        throw new TypeError("Builds is not T extends Singleton");
      }

      if (args) {
        const resolvedArgs = typeof args === "function"
          ? args()
          : args;

        builds.createInstance(...resolvedArgs);
      } else {
        builds.createInstance();
      }

      init?.(builds.getInstance());

      for (const requirement of this.#requirements) {
        requirement.requires.delete(builds);
      }
    }

    this.#requirements.length = 0;
  }
}
