/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable, reaction } from "mobx";
import { StorageHelper } from "../storageHelper";
import { delay } from "../../../common/utils/delay";
import { toJS } from "../../../common/utils";

interface StorageModel {
  [prop: string]: any /*json-serializable*/;
  message?: string;
  description?: any;
}

describe("renderer/utils/StorageHelper", () => {
  describe("Using custom StorageAdapter", () => {
    const storageKey = "ui-settings";
    const remoteStorageMock = observable.map<string, StorageModel>();
    let storageHelper: StorageHelper<StorageModel>;
    let storageHelperAsync: StorageHelper<StorageModel>;

    beforeEach(() => {
      remoteStorageMock.set(storageKey, {
        message: "saved-before", // pretending as previously saved data
      });

      storageHelper = new StorageHelper<StorageModel>(storageKey, {
        autoInit: false,
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

      storageHelperAsync = new StorageHelper(storageKey, {
        autoInit: false,
        defaultValue: storageHelper.defaultValue,
        storage: {
          ...storageHelper.storage,
          async getItem(key: string): Promise<StorageModel> {
            await delay(500); // fake loading timeout

            return storageHelper.storage.getItem(key);
          },
        },
      });
    });

    it("initialized with default value", async () => {
      storageHelper.init();
      expect(storageHelper.key).toBe(storageKey);
      expect(storageHelper.get()).toEqual(storageHelper.defaultValue);
    });

    it("async loading from storage supported too", async () => {
      expect(storageHelperAsync.initialized).toBeFalsy();
      storageHelperAsync.init();
      await delay(300);
      expect(storageHelperAsync.get()).toEqual(storageHelper.defaultValue);
      await delay(200);
      expect(storageHelperAsync.get().message).toBe("saved-before");
    });

    it("set() fully replaces data in storage", () => {
      storageHelper.init();
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
      storageHelper.init();
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

      storageHelper = new StorageHelper<typeof defaultValue>("some-key", {
        autoInit: true,
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
