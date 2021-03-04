// Helper for work with persistent local storage (default: window.localStorage)
// TODO: write unit/integration tests

import { app, remote } from "electron";
import path from "path";
import { ensureDirSync, readJsonSync, writeJson } from "fs-extra";
import type { CreateObservableOptions } from "mobx/lib/api/observable";
import { action, comparer, observable, reaction, toJS, when } from "mobx";
import produce, { Draft, setAutoFreeze } from "immer";
import { isEqual, isFunction, isObject } from "lodash";

setAutoFreeze(false); // allow to merge observables

export function createStorage<T>(key: string, defaultValue?: T, options?: StorageHelperOptions<T>) {
  return new StorageHelper(key, defaultValue, options);
}

export interface StorageHelperOptions<T> extends StorageConfiguration<T> {
  autoInit?: boolean; // default: true
}

export interface StorageConfiguration<T> {
  storage?: StorageAdapter<T>;
  observable?: CreateObservableOptions;
}

export interface StorageAdapter<T> {
  [metadata: string]: any;
  getItem(key: string): T; // import
  setItem(key: string, value: T): void; // export
  removeItem?(key: string): void; // if not provided setItem(key,undefined) will be used
  onChange?(data: { key: string, value: T, oldValue?: T }): void;
}

export class StorageHelper<T> {
  static defaultOptions: StorageHelperOptions<any> = {
    autoInit: true,
    get storage() {
      return jsonFileSyncStorageAdapter;
    },
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
  init() {
    if (this.initialized) return;

    try {
      const value = this.load();
      const notEmpty = value != null;
      const notDefault = !this.isDefaultValue(value);

      if (notEmpty && notDefault) {
        this.merge(value);
      }
      this.initialized = true;
    } catch (error) {
      console.error(`[init]: ${error}`, this);
    }
  }

  isDefaultValue(value: T): boolean {
    return isEqual(value, this.defaultValue);
  }

  @action
  private configure({ storage, observable }: StorageConfiguration<T> = this.options): this {
    if (storage) this.storage = storage;
    if (observable) this.configureObservable(observable);

    return this;
  }

  @action
  private configureObservable(options: CreateObservableOptions = {}) {
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

    this.storage.onChange?.({ value, oldValue, key: this.key });
    this.storage.setItem(this.key, value);
  }

  load(): T {
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

export const localStorageAdapter: StorageAdapter<object> = {
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

// TODO: remove after merge https://github.com/lensapp/lens/pull/2269
export const jsonFileSyncStorageAdapter: StorageAdapter<object> = {
  cwd: path.resolve((app || remote.app).getPath("userData"), "lens-local-storage"),
  data: observable.map<string, any>([], { deep: false }),
  initialized: false,

  get filePath() {
    const clusterId = location.hostname.split(".").slice(-2, -1)[0];

    return path.resolve(this.cwd, `${clusterId ?? "app"}.json`);
  },

  init() {
    if (this.initialized) return;

    try {
      ensureDirSync(this.cwd, { mode: 0o755 });
      const data = readJsonSync(this.filePath, { throws: false }) || {};

      this.data.replace(data);
      this.bindAutoSave();
    } catch (error) {
      console.error(`[init]: ${this.filePath} failed: ${error}`, this);
    } finally {
      this.initialized = true;
    }
  },

  bindAutoSave() {
    return reaction(() => this.data.toJSON(), async (data) => {
      try {
        await writeJson(this.filePath, data, { spaces: 2 });
      } catch (error) {
        console.error(`[save]: ${this.filePath} failed: ${error}`, this);
      }
    });
  },

  getItem(key: string) {
    this.init();

    return this.data.get(key);
  },
  setItem(key: string, value: any) {
    this.data.set(key, value);
  },
  removeItem(key: string) {
    this.data.delete(key);
  }
};
