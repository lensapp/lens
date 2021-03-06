// Helper for work with persistent local storage (default: window.localStorage)

import { app, remote } from "electron";
import path from "path";
import { ensureDir, readJson, writeJson } from "fs-extra";
import type { CreateObservableOptions } from "mobx/lib/api/observable";
import { action, comparer, observable, reaction, toJS, when } from "mobx";
import produce, { Draft, enableMapSet, setAutoFreeze } from "immer";
import { isEqual, isFunction, isObject, noop } from "lodash";

setAutoFreeze(false); // allow to merge observables
enableMapSet(); // allow merging maps and sets

export function createStorage<T>(key: string, defaultValue?: T, observableOptions?: CreateObservableOptions) {
  return new StorageHelper<T>(key, {
    autoInit: true,
    storage: jsonFileStorageAdapter as StorageAdapter<T>,
    observable: observableOptions,
    defaultValue,
  });
}

export type StorageModel = Record<string, any>; // any json-compatible model

export interface StorageAdapter<T = StorageModel> {
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

export class StorageHelper<T = StorageModel> {
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

  constructor(readonly key: string, readonly options: StorageHelperOptions<T>) {
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
    const currentValue = this.toJS();
    const nextValue = produce(currentValue, updater) as T;

    this.set(nextValue);
  }

  toJS() {
    return toJS(this.get(), { recurseEverything: true });
  }
}

/**
 * Keep intended window.localStorage state in external JSON-file.
 * Reason: app creates random ports between restarts and as a result storage not persistent.
 */
export const jsonFileStorageAdapter: StorageAdapter = {
  cwd: path.resolve((app || remote.app).getPath("userData"), "lens-local-storage"),
  data: observable.map<string, any>([], { deep: false }),
  initialized: false,

  get filePath() {
    // TODO: use getHostedClusterId() after moving out from cluster-store.ts
    const clusterId = location.hostname.split(".").slice(-2, -1)[0];

    return path.resolve(this.cwd, `${clusterId ?? "app"}.json`);
  },

  async init() {
    if (this.initialized) return;

    const data = await readJson(this.filePath).catch(noop);

    if (data) {
      this.data.replace(data);
    }
    this.bindAutoSave();
    this.initialized = true;
  },

  bindAutoSave() {
    return reaction(() => this.data.toJSON(), async (data) => {
      try {
        await ensureDir(this.cwd, { mode: 0o755 });
        await writeJson(this.filePath, data, { spaces: 2 });
      } catch (error) {
        console.error(`[save]: ${this.filePath}: ${error}`, this);
      }
    });
  },

  async getItem(key: string) {
    await this.init();

    return this.data.get(key);
  },
  setItem(key: string, value: any) {
    this.data.set(key, value);
  },
  removeItem(key: string) {
    this.data.delete(key);
  }
};
