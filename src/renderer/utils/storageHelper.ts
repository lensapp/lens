// Helper for work with persistent local storage (default: window.localStorage)
// TODO: write unit/integration tests

import type { CreateObservableOptions } from "mobx/lib/api/observable";
import { action, comparer, observable, toJS, when } from "mobx";
import produce, { Draft, setAutoFreeze } from "immer";
import { isEmpty, isEqual, isFunction } from "lodash";

setAutoFreeze(false); // allow to merge observables

export interface StorageHelperOptions<T> extends StorageConfiguration<T> {
  autoInit?: boolean; // default: true
}

export interface StorageConfiguration<T> {
  storage?: StorageAdapter<T>;
  observable?: CreateObservableOptions;
}

export interface StorageAdapter<T> {
  getItem(key: string): T | Promise<T>; // import
  setItem(key: string, value: T): void; // export
  removeItem?(key: string): void; // if not provided setItem(key,undefined) will be used
  onChange?(value: T, oldValue?: T): void;
}

export const localStorageAdapter: StorageAdapter<Record<string, any>> = {
  getItem(key: string) {
    return JSON.parse(localStorage.getItem(key));
  },
  setItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem(key: string) {
    localStorage.removeItem(key);
  }
};

export class StorageHelper<T = any> {
  static defaultOptions: StorageHelperOptions<any> = {
    autoInit: true,
    storage: localStorageAdapter,
    observable: {
      deep: true,
      equals: comparer.shallow,
    }
  };

  private data = observable.box<T>();
  @observable.ref storage: StorageAdapter<T>;
  @observable initialized = false;
  whenReady = when(() => this.initialized);

  constructor(readonly key: string, readonly defaultValue?: T, readonly options: StorageHelperOptions<T> = {}) {
    this.options = { ...StorageHelper.defaultOptions, ...options };
    this.configure();
    this.reset();

    if (this.options.autoInit) {
      this.init();
    }
  }

  @action
  async init() {
    if (this.initialized) return;

    try {
      const value = await this.load();
      const notEmpty = this.hasValue(value);
      const notDefault = !this.isDefaultValue(value);

      if (notEmpty && notDefault) {
        this.merge(value);
      }
      this.initialized = true;
    } catch (error) {
      console.error(`[init]: ${error}`, this);
    }
  }

  hasValue(value: T) {
    return !isEmpty(value);
  }

  isDefaultValue(value: T) {
    return isEqual(value, this.defaultValue);
  }

  @action
  private configure({ storage, observable }: StorageConfiguration<T> = this.options): this {
    if (storage) this.configureStorage(storage);
    if (observable) this.configureObservable(observable);

    return this;
  }

  @action
  protected configureStorage(storage: StorageAdapter<T>) {
    this.storage = Object.getOwnPropertyNames(storage).reduce((storage, name: keyof StorageAdapter<T>) => {
      storage[name] = storage[name]?.bind(this); // bind storage-adapter methods to "this"-context

      return storage;
    }, { ...storage });
  }

  @action
  protected configureObservable(options: CreateObservableOptions = {}) {
    this.data = observable.box<T>(this.data.get(), {
      ...StorageHelper.defaultOptions.observable, // inherit default observability options
      ...options,
    });
    this.data.observe(change => {
      const { newValue, oldValue } = toJS(change, { recurseEverything: true });

      this.onChange(newValue, oldValue);
    });
  }

  protected onChange(value: T, oldValue?: T) {
    if (!this.initialized) return;

    this.storage.onChange?.(value, oldValue);
    this.storage.setItem(this.key, value);
  }

  async load(): Promise<T> {
    return this.storage.getItem(this.key);
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
    const updater = isFunction(value) ? value : (state: Draft<T>) => Object.assign(state, value);
    const currentValue = this.toJS();
    const nextValue = produce(currentValue, updater) as T;

    this.set(nextValue);
  }

  toJS() {
    return toJS(this.get(), { recurseEverything: true });
  }
}
