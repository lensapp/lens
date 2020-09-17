// Helper to work with browser's local/session storage api

export interface StorageHelperOptions<T> {
  addKeyPrefix?: boolean;
  useSession?: boolean; // use `sessionStorage` instead of `localStorage`
  parse?(from: string): T;
  stringify?(from: T): string;
}

export function createStorage<T>(key: string, defaultValue?: T, options?: StorageHelperOptions<T>) {
  return new StorageHelper(key, defaultValue, options);
}

export class StorageHelper<T> {
  static keyPrefix = "lens_";

  static defaultOptions: StorageHelperOptions<any> = {
    addKeyPrefix: true,
    useSession: false,
    parse: JSON.parse,
    stringify: JSON.stringify,
  }

  constructor(protected key: string, protected defaultValue?: T, protected options?: StorageHelperOptions<T>) {
    this.options = Object.assign({}, StorageHelper.defaultOptions, options);

    if (this.options.addKeyPrefix) {
      this.key = StorageHelper.keyPrefix + key;
    }
  }

  protected get storage() {
    if (this.options.useSession) return window.sessionStorage;
    return window.localStorage;
  }

  get(): T {
    const strValue = this.storage.getItem(this.key);
    if (strValue != null) {
      try {
        return this.options.parse(strValue)
      } catch (e) {
        console.error(`Parsing failed for pair: ${this.key}=${strValue}`)
      }
    }
    return this.defaultValue;
  }

  set(value: T) {
    this.storage.setItem(this.key, this.options.stringify(value));
    return this;
  }

  merge(value: Partial<T>) {
    const currentValue = this.get();
    return this.set(Object.assign(currentValue, value));
  }

  clear() {
    this.storage.removeItem(this.key);
    return this;
  }

  getDefaultValue() {
    return this.defaultValue;
  }

  restoreDefaultValue() {
    return this.set(this.defaultValue);
  }
}
