// Helper for working with storages (e.g. window.localStorage, NodeJS/file-system, etc.)

import { action, comparer, CreateObservableOptions, IObservableValue, IReactionDisposer, makeObservable, observable, reaction, toJS, when } from "mobx";
import produce, { Draft } from "immer";
import { isEqual, isFunction, isPlainObject, merge } from "lodash";
import logger from "../../main/logger";

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

  private data: IObservableValue<T>;
  protected unwatchChanges: IReactionDisposer;
  public readonly storage: StorageAdapter<T>;
  public readonly defaultValue: T;

  @observable initialized = false;
  whenReady = when(() => this.initialized);

  constructor(readonly key: string, private options: StorageHelperOptions<T>) {
    makeObservable(this);

    this.options = merge({}, StorageHelper.defaultOptions, options);
    this.storage = options.storage;
    this.defaultValue = options.defaultValue;
    this.data = observable.box(this.defaultValue, this.options.observable);

    this.unwatchChanges = reaction(() => toJS(this.data.get()), (newValue, oldValue) => {
      this.onChange(newValue, oldValue);
    }, this.options.observable);

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

  destroy() {
    this.unwatchChanges();
  }

  toJS() {
    return toJS(this.get());
  }
}
