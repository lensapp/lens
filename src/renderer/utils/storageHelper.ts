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

// Helper for working with storages (e.g. window.localStorage, NodeJS/file-system, etc.)
import { action, comparer, makeObservable, observable, toJS, when } from "mobx";
import { produce, Draft, isDraft } from "immer";
import { isEqual, isPlainObject } from "lodash";
import logger from "../../main/logger";
import { getHostedClusterId } from "../../common/utils";
import path from "path";
import { AppPaths } from "../../common/app-paths";

export interface StorageAdapter<T> {
  [metadata: string]: any;
  getItem(key: string): T | Promise<T>;
  setItem(key: string, value: T): void;
  removeItem(key: string): void;
  onChange?(change: { key: string, value: T, oldValue?: T }): void;
}

export interface StorageHelperOptions<T> {
  autoInit?: boolean; // start preloading data immediately, default: true
  storage: StorageAdapter<T>;
  defaultValue: T;
}

export class StorageHelper<T> {
  static async getLocalStoragePath() {
    return path.resolve(await AppPaths.getAsync("userData"), "lens-local-storage", `${getHostedClusterId() || "app"}.json`);
  }

  static logPrefix = "[StorageHelper]:";
  readonly storage: StorageAdapter<T>;

  private data = observable.box<T>(undefined, {
    deep: true,
    equals: comparer.structural,
  });

  @observable initialized = false;

  get whenReady() {
    return when(() => this.initialized);
  }

  get defaultValue(): T {
    // return as-is since options.defaultValue might be a getter too
    return this.options.defaultValue;
  }

  constructor(readonly key: string, private options: StorageHelperOptions<T>) {
    makeObservable(this);

    const { storage, autoInit = true } = options;

    this.storage = storage;

    this.data.observe_(({ newValue, oldValue }) => {
      this.onChange(newValue as T, oldValue as T);
    });

    if (autoInit) {
      this.init();
    }
  }

  private onData = (data: T): void => {
    const notEmpty = data != null;
    const notDefault = !this.isDefaultValue(data);

    if (notEmpty && notDefault) {
      this.set(data);
    }

    this.initialized = true;
  };

  private onError = (error: any): void => {
    logger.error(`${StorageHelper.logPrefix} loading error: ${error}`, this);
  };

  @action
  init({ force = false } = {}) {
    if (this.initialized && !force) {
      return;
    }

    try {
      const data = this.storage.getItem(this.key);

      if (data instanceof Promise) {
        data.then(this.onData, this.onError);
      } else {
        this.onData(data);
      }
    } catch (error) {
      this.onError(error);
    }
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
      logger.error(`${StorageHelper.logPrefix} updating storage: ${error}`, this, { value, oldValue });
    }
  }

  get(): T {
    return this.data.get() ?? this.defaultValue;
  }

  @action
  set(value: T) {
    if (this.isDefaultValue(value)) {
      this.reset();
    } else {
      this.data.set(value);
    }
  }

  @action
  reset() {
    this.data.set(undefined);
  }

  @action
  merge(value: Partial<T> | ((draft: Draft<T>) => Partial<T> | void)) {
    const nextValue = produce<T>(this.toJSON(), (draft: Draft<T>) => {

      if (typeof value == "function") {
        const newValue = value(draft);

        // merge returned plain objects from `value-as-callback` usage
        // otherwise `draft` can be just modified inside a callback without returning any value (void)
        if (newValue && !isDraft(newValue)) {
          Object.assign(draft, newValue);
        }
      } else if (isPlainObject(value)) {
        Object.assign(draft, value);
      }

      return draft;
    });

    this.set(nextValue);
  }

  toJSON(): T {
    return toJS(this.get());
  }
}
