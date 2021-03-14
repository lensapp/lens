// Helper for working with storages (e.g. window.localStorage, NodeJS/file-system, etc.)

import type { CreateObservableOptions } from "mobx/lib/api/observable";
import { action, comparer, observable, toJS, when } from "mobx";
import produce, { Draft, enableMapSet, setAutoFreeze } from "immer";
import { isEqual, isFunction, isObject } from "lodash";

setAutoFreeze(false); // allow to merge observables
enableMapSet(); // allow merging maps and sets

export interface StorageAdapter<T> {
  [metadata: string]: any;
  getItem(key: string): T | Promise<T>;
  setItem(key: string, value: T): void;
  removeItem(key: string): void;
  onChange?(change: { key: string, value: T, oldValue?: T }): void;
}

export interface StorageHelperOptions<T> {
  autoInit?: boolean; // start preloading data immediately, default: true
  observable?: CreateObservableOptions;
  storage: StorageAdapter<T>;
  defaultValue?: T;
}

export class StorageHelper<T> {
  static defaultOptions: Partial<StorageHelperOptions<any>> = {
    autoInit: true,
    observable: {
      deep: true,
      equals: comparer.shallow,
    }
  };

  @observable private data = observable.box<T>();
  @observable initialized = false;
  whenReady = when(() => this.initialized);

  get storage(): StorageAdapter<T> {
    return this.options.storage;
  }

  get defaultValue(): T {
    return this.options.defaultValue;
  }

  constructor(readonly key: string, private options: StorageHelperOptions<T>) {
    this.options = { ...StorageHelper.defaultOptions, ...options };
    this.configureObservable();
    this.reset();

    if (this.options.autoInit) {
      this.init();
    }
  }

  @action
  async init() {
    if (this.initialized) return;

    try {
      await this.load();
      this.initialized = true;
    } catch (error) {
      console.error(`[init]: ${error}`, this);
    }
  }

  isDefaultValue(value: T): boolean {
    return isEqual(value, this.defaultValue);
  }

  @action
  private configureObservable(options = this.options.observable) {
    this.data = observable.box<T>(this.data.get(), {
      ...StorageHelper.defaultOptions.observable, // inherit default observability options
      ...(options ?? {}),
    });
    this.data.observe(change => {
      const { newValue, oldValue } = toJS(change, { recurseEverything: true });

      this.onChange(newValue, oldValue);
    });
  }

  protected onChange(value: T, oldValue?: T) {
    if (!this.initialized) return;

    try {
      if (value == null) {
        this.storage.removeItem(this.key);
      } else {
        this.storage.setItem(this.key, value);
      }

      this.storage.onChange?.({ value, oldValue, key: this.key });
    } catch (error) {
      console.error(`[change]: ${error}`, this, { value, oldValue });
    }
  }

  async load(): Promise<T> {
    const value = await this.storage.getItem(this.key);
    const notEmpty = value != null;
    const notDefault = !this.isDefaultValue(value);

    if (notEmpty && notDefault) {
      this.merge(value);
    }

    return value;
  }

  get(): T {
    return this.data.get();
  }

  set(value: T) {
    this.data.set(value);
  }

  reset() {
    this.set(this.defaultValue);
  }

  clear() {
    this.data.set(null);
  }

  merge(value: Partial<T> | ((draft: Draft<T>) => Partial<T> | void)) {
    const updater = isFunction(value) ? value : (state: Draft<T>) => {
      if (isObject(state)) return Object.assign(state, value);

      return value;
    };
    const nextValue = produce(this.get(), updater) as T;

    this.set(nextValue);
  }

  toJS() {
    return toJS(this.get(), { recurseEverything: true });
  }
}
