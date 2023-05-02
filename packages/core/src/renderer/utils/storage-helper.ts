/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Helper for working with storages (e.g. window.localStorage, NodeJS/file-system, etc.)
import { action, comparer, computed, makeObservable, observable, observe, toJS } from "mobx";
import type { Draft } from "immer";
import { produce, isDraft } from "immer";
import { isEqual, isPlainObject } from "lodash";
import assert from "assert";
import type { Logger } from "@k8slens/logger";

export interface StorageChange<T> {
  key: string;
  value: T | undefined;
  oldValue: T | undefined;
}

export interface StorageAdapter<T> {
  [metadata: string]: unknown;
  getItem(key: string): T;
  setItem(key: string, value: T): void;
  removeItem(key: string): void;
  onChange?(change: StorageChange<T>): void;
}

export interface StorageHelperOptions<T> {
  readonly storage: StorageAdapter<T>;
  readonly defaultValue: T;
}

export interface StorageLayer<T> {
  isDefaultValue(val: T): boolean;
  get(): T;
  set(value: T): void;
  reset(): void;
  merge(value: Partial<T> | ((draft: Draft<T>) => Partial<T> | void)): void;
}

export const storageHelperLogPrefix = "[STORAGE-HELPER]:";

export interface StorageHelperDependencies {
  readonly logger: Logger;
}

export class StorageHelper<T> implements StorageLayer<T> {
  readonly storage: StorageAdapter<T>;

  private readonly data = observable.box<T>(undefined, {
    deep: true,
    equals: comparer.structural,
  });

  private readonly value = computed(() => this.data.get() ?? this.defaultValue);

  get defaultValue(): T {
    // return as-is since options.defaultValue might be a getter too
    return this.options.defaultValue;
  }

  constructor(private readonly dependencies: StorageHelperDependencies, readonly key: string, private readonly options: StorageHelperOptions<T>) {
    makeObservable(this);

    this.storage = this.options.storage;

    observe(this.data, (change) => {
      this.onChange(change.newValue as T | undefined, change.oldValue as T | undefined);
    });

    try {
      const data = this.storage.getItem(this.key);
      const notEmpty = data != null;
      const notDefault = !this.isDefaultValue(data);

      if (notEmpty && notDefault) {
        this.set(data);
      }
    } catch (error) {
      this.dependencies.logger.error(`${storageHelperLogPrefix} loading error: ${error}`, this);
    }
  }

  isDefaultValue(value: T): boolean {
    return isEqual(value, this.defaultValue);
  }

  private onChange(value: T | undefined, oldValue: T | undefined) {
    try {
      if (value == null) {
        this.storage.removeItem(this.key);
      } else {
        this.storage.setItem(this.key, value);
      }

      this.storage.onChange?.({ value, oldValue, key: this.key });
    } catch (error) {
      this.dependencies.logger.error(`${storageHelperLogPrefix} updating storage: ${error}`, this, { value, oldValue });
    }
  }

  get(): T {
    return this.value.get();
  }

  @action
  set(value: T) {
    if (this.isDefaultValue(value)) {
      this.data.set(undefined);
    } else {
      this.data.set(value);
    }
  }

  @action
  reset() {
    this.data.set(undefined);
  }

  @action
  merge(value: T extends object ? Partial<T> | ((draft: Draft<T>) => Partial<T> | void) : never) {
    const nextValue = produce<T>(toJS(this.get()), (draft) => {
      assert(typeof draft === "object" && draft);

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
