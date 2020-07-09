// Helper to work with browser's local/session storage api

export interface StorageHelperOptions {
  addKeyPrefix?: boolean;
  useSession?: boolean; // use `sessionStorage` instead of `localStorage`
}

export class StorageHelper<T> {
  static keyPrefix = "lens_";

  static defaultOptions: StorageHelperOptions = {
    addKeyPrefix: true,
    useSession: false,
  }

  constructor(protected key: string, protected defaultValue?: T, protected options?: StorageHelperOptions) {
    this.options = Object.assign({}, StorageHelper.defaultOptions, options);

    if (this.options.addKeyPrefix) {
      this.key = StorageHelper.keyPrefix + key;
    }
  }

  protected get storage(): Storage {
    if (this.options.useSession) {
      return window.sessionStorage;
    }
    return window.localStorage;
  }

  get(): T {
    const strValue = this.storage.getItem(this.key);
    if (strValue != null) {
      try {
        return JSON.parse(strValue);
      } catch (e) {
        console.error(`Parsing json failed for pair: ${this.key}=${strValue}`);
      }
    }
    return this.defaultValue;
  }

  set(value: T): StorageHelper<T> {
    this.storage.setItem(this.key, JSON.stringify(value));
    return this;
  }

  merge(value: Partial<T>): StorageHelper<T> {
    const currentValue = this.get();
    return this.set(Object.assign(currentValue, value));
  }

  clear(): StorageHelper<T> {
    this.storage.removeItem(this.key);
    return this;
  }

  getDefaultValue(): T {
    return this.defaultValue;
  }

  restoreDefaultValue(): StorageHelper<T> {
    return this.set(this.defaultValue);
  }
}
