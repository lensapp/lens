/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable, reaction } from "mobx";
import type { StorageHelper } from "../storage-helper";
import { toJS } from "../../../common/utils";
import type { CreateStorageHelper } from "../create-storage-helper.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import createStorageHelperInjectable from "../create-storage-helper.injectable";

interface StorageModel {
  [prop: string]: any /*json-serializable*/;
  message?: string;
  description?: any;
}

describe("renderer/utils/StorageHelper", () => {
  let createStorageHelper: CreateStorageHelper;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    createStorageHelper = di.inject(createStorageHelperInjectable);
  });

  describe("Using custom StorageAdapter", () => {
    const storageKey = "ui-settings";
    const remoteStorageMock = observable.map<string, StorageModel>();
    let storageHelper: StorageHelper<StorageModel>;

    beforeEach(() => {
      remoteStorageMock.set(storageKey, {
        message: "saved-before", // pretending as previously saved data
      });

      storageHelper = createStorageHelper<StorageModel>(storageKey, {
        defaultValue: {
          message: "blabla",
          description: "default",
        },
        storage: {
          getItem(key: string): StorageModel {
            return Object.assign(
              storageHelper.defaultValue,
              remoteStorageMock.get(key),
            );
          },
          setItem(key: string, value: StorageModel) {
            remoteStorageMock.set(key, value);
          },
          removeItem(key: string) {
            remoteStorageMock.delete(key);
          },
        },
      });
    });

    it("initialized with default value", async () => {
      expect(storageHelper.key).toBe(storageKey);
      expect(storageHelper.get()).toEqual(storageHelper.defaultValue);
    });

    it("set() fully replaces data in storage", () => {
      storageHelper.set({ message: "msg" });
      storageHelper.get().description = "desc";
      expect(storageHelper.get().message).toBe("msg");
      expect(storageHelper.get().description).toBe("desc");
      expect(remoteStorageMock.get(storageKey)).toEqual({
        message: "msg",
        description: "desc",
      } as StorageModel);
    });

    it("merge() does partial data tree updates", () => {
      storageHelper.merge({ message: "updated" });

      expect(storageHelper.get()).toEqual({ ...storageHelper.defaultValue, message: "updated" });
      expect(remoteStorageMock.get(storageKey)).toEqual({ ...storageHelper.defaultValue, message: "updated" });

      // `draft` modified inside, returning `void` is expected
      storageHelper.merge(draft => {
        draft.message = "updated2";
      });
      expect(storageHelper.get()).toEqual({ ...storageHelper.defaultValue, message: "updated2" });

      // returning object modifies `draft` as well
      storageHelper.merge(draft => ({
        message: draft.message?.replace("2", "3"),
      }));
      expect(storageHelper.get()).toEqual({ ...storageHelper.defaultValue, message: "updated3" });
    });
  });

  describe("data in storage-helper is observable (mobx)", () => {
    let storageHelper: StorageHelper<any>;
    const defaultValue: any = { firstName: "Joe" };
    const observedChanges: any[] = [];

    beforeEach(() => {
      observedChanges.length = 0;

      storageHelper = createStorageHelper<typeof defaultValue>("some-key", {
        defaultValue,
        storage: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
      });
    });

    it("storage.get() is observable", () => {
      expect(storageHelper.get()).toEqual(defaultValue);

      reaction(() => toJS(storageHelper.get()), change => {
        observedChanges.push(change);
      });

      storageHelper.merge({ lastName: "Black" });
      storageHelper.set("whatever");
      expect(observedChanges).toEqual([{ ...defaultValue, lastName: "Black" }, "whatever"]);
    });
  });

});
