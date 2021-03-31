// Helper for working with storages (e.g. window.localStorage, NodeJS/file-system, etc.)

import type { CreateObservableOptions } from "mobx/lib/api/observable";
import { action, comparer, observable, toJS, when } from "mobx";
import produce, { Draft, enableMapSet, setAutoFreeze } from "immer";
import { isEqual, isFunction, isPlainObject } from "lodash";
import logger from "../../main/logger";

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
  defaultValue: T;
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
  init({ force = false } = {}) {
    if (this.initialized && !force) return;

    this.loadFromStorage({
      onData: (data: T) => {
        const notEmpty = data != null;
        const notDefault = !this.isDefaultValue(data);

        if (notEmpty && notDefault) {
          this.merge(data);
        }

        this.initialized = true;
      },
      onError: (error?: any) => {
        logger.error(`[init]: ${error}`, this);
      },
    });
  }

  private loadFromStorage(opts: { onData?(data: T): void, onError?(error?: any): void } = {}) {
    let data: T | Promise<T>;

    try {
      data = this.storage.getItem(this.key); // sync reading from storage when exposed

      if (data instanceof Promise) {
        data.then(opts.onData, opts.onError);
      } else {
        opts?.onData(data);
      }
    } catch (error) {
      logger.error(`[load]: ${error}`, this);
      opts?.onError(error);
    }

    return data;
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
      logger.error(`[change]: ${error}`, this, { value, oldValue });
    }
  }

  get(): T {
    return this.data.get();
  }

  set(value: T) {
    if (value == null) {
      // This cannot use recursion because defaultValue might be null or undefined
      this.data.set(this.defaultValue);
    } else {
      this.data.set(value);
    }
  }

  reset() {
    this.set(this.defaultValue);
  }

  merge(value: Partial<T> | ((draft: Draft<T>) => Partial<T> | void)) {
    const nextValue = produce(this.get(), (state: Draft<T>) => {
      const newValue = isFunction(value) ? value(state) : value;

      return isPlainObject(newValue)
        ? Object.assign(state, newValue) // partial updates for returned plain objects
        : newValue;
    });

    this.set(nextValue as T);
  }

  toJS() {
    return toJS(this.get(), { recurseEverything: true });
  }
}
