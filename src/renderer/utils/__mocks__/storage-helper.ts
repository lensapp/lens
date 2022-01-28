/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { deepStrictEqual } from "assert";
import { Draft, isDraft, produce } from "immer";
import { isPlainObject } from "lodash";
import { IObservableValue, observable } from "mobx";
import { toJS } from "..";

export interface MockedStorageLayer<T> {
  key: string;
  defaultValue: T;
  whenReady: Promise<void>;
  isDefaultValue: jest.MockedFunction<(value: T) => boolean>;
  get: jest.MockedFunction<() => T>;
  set: jest.MockedFunction<(value: T) => void>;
  reset: jest.MockedFunction<() => void>;
  merge: jest.MockedFunction<(value: Partial<T> | ((draft: Draft<T>) => Partial<T> | void)) => void>;
  toJSON: jest.MockedFunction<() => T>;
  _box: IObservableValue<T>;
}

export function getStorageLayerMock<T>(key: string, defaultValue: T): Promise<MockedStorageLayer<T>> {
  const _box = observable.box<T>(defaultValue);
  const set = jest.fn().mockImplementation((val) => _box.set(val));
  const toJSON = jest.fn().mockImplementation(() => toJS(_box));

  return Promise.resolve({
    _box,
    key,
    defaultValue,
    whenReady: Promise.resolve(),
    isDefaultValue: jest.fn().mockImplementation(val => deepStrictEqual(val, defaultValue)),
    get: jest.fn().mockImplementation(() => _box.get()),
    set,
    reset: jest.fn().mockImplementation(() => _box.set(defaultValue)),
    merge: jest.fn().mockImplementation((value: Partial<T> | ((draft: Draft<T>) => Partial<T> | void)) => {
      const nextValue = produce<T>(toJSON(), (draft: Draft<T>) => {

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

      set(nextValue);
    }),
    toJSON,
  });
}
