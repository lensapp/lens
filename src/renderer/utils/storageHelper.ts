/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Helper for working with storages (e.g. window.localStorage, NodeJS/file-system, etc.)
import { action, comparer, computed, makeObservable, observable, toJS, when } from "mobx";
import type { Draft } from "immer";
import { produce, isDraft } from "immer";
import { isEqual, isPlainObject } from "lodash";
import logger from "../../main/logger";

export interface StorageAdapter<T> {
  [metadata: string]: any;
  getItem(key: string): T | Promise<T>;
  setItem(key: string, value: T): void;
  removeItem(key: string): void;
  onChange?(change: { key: string; value: T; oldValue?: T }): void;
}

export interface StorageHelperOptions<T> {
  autoInit?: boolean; // start preloading data immediately, default: true
  storage: StorageAdapter<T>;
  defaultValue: T;
}

export interface StorageLayer<T> {
  isDefaultValue(val: T): boolean;
  get(): T;
  readonly value: T;
  readonly whenReady: Promise<void>;
  set(value: T): void;
  reset(): void;
  merge(value: Partial<T> | ((draft: Draft<T>) => Partial<T> | void)): void;
}

export class StorageHelper<T> implements StorageLayer<T> {
  static logPrefix = "[StorageHelper]:";
  readonly storage: StorageAdapter<T>;

  private data = observable.box<T | undefined>(undefined, {
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

    // TODO: This code uses undocumented MobX internal to criminally permit exotic mutations without encapsulation.
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
    return this.value;
  }

  @computed
  get value(): T {
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
    const nextValue = produce<T>(toJS(this.get()), (draft) => {

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
}
