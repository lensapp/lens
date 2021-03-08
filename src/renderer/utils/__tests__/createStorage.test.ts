import { StorageAdapter, StorageHelper } from "../createStorage";

describe("renderer/utils/StorageHelper", () => {
  describe("window.localStorage might be used as StorageAdapter", () => {
    type StorageModel = string;

    const storageKey = "ui-settings";
    let storageHelper: StorageHelper<StorageModel>;

    beforeEach(() => {
      localStorage.clear();

      storageHelper = new StorageHelper<StorageModel>(storageKey, {
        autoInit: false,
        storage: localStorage,
        defaultValue: "test",
      });
    });

    it("initialized with default value", async () => {
      localStorage.setItem(storageKey, "saved"); // pretending it was saved previously

      expect(storageHelper.key).toBe(storageKey);
      expect(storageHelper.defaultValue).toBe("test");
      expect(storageHelper.get()).toBe("test");

      await storageHelper.init();

      expect(storageHelper.key).toBe(storageKey);
      expect(storageHelper.defaultValue).toBe("test");
      expect(storageHelper.get()).toBe("saved");
    });

    it("updates storage", async () => {
      await storageHelper.init();

      storageHelper.set("test2");
      expect(localStorage.getItem(storageKey)).toBe("test2");

      localStorage.setItem(storageKey, "test3");
      await storageHelper.load(); // reload from underlying storage
      expect(storageHelper.get()).toBe("test3");
    });
  });

  describe("Using custom StorageAdapter", () => {
    type SettingsStorageModel = {
      [key: string]: any;
      message: string;
    };

    const storageKey = "mySettings";
    const storageMock: Record<string, any> = {};
    let storageHelper: StorageHelper<SettingsStorageModel>;
    let storageAdapter: StorageAdapter<SettingsStorageModel>;

    const storageHelperDefaultValue: SettingsStorageModel = {
      message: "hello-world",
      anyOtherStorableData: 123,
    };

    beforeEach(() => {
      storageMock[storageKey] = {
        message: "saved-before",
      } as SettingsStorageModel;

      storageAdapter = {
        onChange: jest.fn(),
        getItem: jest.fn((key: string): Promise<any> => {
          return storageMock[key];
        }),
        setItem: jest.fn((key: string, value: any) => {
          storageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete storageMock[key];
        }),
      };

      storageHelper = new StorageHelper(storageKey, {
        autoInit: false,
        storage: storageAdapter,
        defaultValue: storageHelperDefaultValue,
      });
    });

    it("loads data from storage with fallback to default-value", async () => {
      expect(storageHelper.get()).toEqual(storageHelperDefaultValue);

      await storageHelper.init();
      expect(storageHelper.get().message).toBe("saved-before");
      expect(storageAdapter.getItem).toHaveBeenCalledWith(storageHelper.key);
    });

    it("updates data in storage", async () => {
      await storageHelper.init();

      storageHelper.set({ message: "test2" });
      expect(storageHelper.get().message).toBe("test2");
      expect(storageMock[storageKey]).toEqual({ message: "test2" });
      expect(storageAdapter.setItem).toHaveBeenCalledWith(storageHelper.key, { message: "test2" });
    });

    it("deletes data in storage", async () => {
      await storageHelper.init();

      expect(storageHelper.get()).toBeTruthy();
      storageHelper.clear();
      expect(storageHelper.get()).toBeFalsy();
      expect(storageMock[storageKey]).toBeUndefined();
      expect(storageAdapter.removeItem).toHaveBeenCalledWith(storageHelper.key);
    });

    it("merges data into storage", async () => {
      expect(storageHelper.get()).toEqual(storageHelperDefaultValue);

      await storageHelper.init();

      storageHelper.merge(draft => {
        draft.message = "updated";
      });

      const expectedValue = { ...storageHelperDefaultValue, message: "updated" };

      expect(storageHelper.get()).toEqual(expectedValue);
      expect(storageAdapter.setItem).toHaveBeenCalledWith(storageHelper.key, expectedValue);
    });
  });

});
