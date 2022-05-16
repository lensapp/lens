/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import mockFs from "mock-fs";
import { BaseStore } from "../base-store";
import { action, comparer, makeObservable, observable, toJS } from "mobx";
import { readFileSync } from "fs";

import directoryForUserDataInjectable
  from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import getConfigurationFileModelInjectable
  from "../get-configuration-file-model/get-configuration-file-model.injectable";
import appVersionInjectable
  from "../get-configuration-file-model/app-version/app-version.injectable";

jest.mock("electron", () => ({
  ipcMain: {
    on: jest.fn(),
    off: jest.fn(),
  },
}));

interface TestStoreModel {
  a: string;
  b: string;
  c: string;
}

class TestStore extends BaseStore<TestStoreModel> {
  @observable a = "";
  @observable b = "";
  @observable c = "";

  constructor() {
    super({
      configName: "test-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
    });

    makeObservable(this);
    this.load();
  }

  @action updateAll(data: TestStoreModel) {
    this.a = data.a;
    this.b = data.b;
    this.c = data.c;
  }

  @action fromStore(data: Partial<TestStoreModel> = {}) {
    this.a = data.a || "";
    this.b = data.b || "";
    this.c = data.c || "";
  }

  onSync(data: TestStoreModel) {
    super.onSync(data);
  }

  async saveToFile(model: TestStoreModel) {
    return super.saveToFile(model);
  }

  toJSON(): TestStoreModel {
    const data: TestStoreModel = {
      a: this.a,
      b: this.b,
      c: this.c,
    };

    return toJS(data);
  }
}

describe("BaseStore", () => {
  let store: TestStore;

  beforeEach(async () => {
    const mainDi = getDiForUnitTesting({ doGeneralOverrides: true });

    mainDi.override(directoryForUserDataInjectable, () => "some-user-data-directory");
    mainDi.permitSideEffects(getConfigurationFileModelInjectable);
    mainDi.permitSideEffects(appVersionInjectable);

    await mainDi.runSetups();

    TestStore.resetInstance();

    const mockOpts = {
      "some-user-data-directory": {
        "test-store.json": JSON.stringify({}),
      },
    };

    mockFs(mockOpts);

    store = TestStore.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
    store.disableSync();
    TestStore.resetInstance();
  });

  describe("persistence", () => {
    it("persists changes to the filesystem", () => {
      store.updateAll({
        a: "foo", b: "bar", c: "hello",
      });

      const data = JSON.parse(readFileSync("some-user-data-directory/test-store.json").toString());

      expect(data).toEqual({ a: "foo", b: "bar", c: "hello" });
    });

    it("persists transaction only once", () => {
      const fileSpy = jest.spyOn(store, "saveToFile");

      store.updateAll({
        a: "foo", b: "bar", c: "hello",
      });

      expect(fileSpy).toHaveBeenCalledTimes(1);
    });

    it("persists changes one-by-one without transaction", () => {
      const fileSpy = jest.spyOn(store, "saveToFile");

      store.a = "a";
      store.b = "b";

      expect(fileSpy).toHaveBeenCalledTimes(2);

      const data = JSON.parse(readFileSync("some-user-data-directory/test-store.json").toString());

      expect(data).toEqual({ a: "a", b: "b", c: "" });
    });

    it("persists changes coming via onSync (sync from different process)", () => {
      const fileSpy = jest.spyOn(store, "saveToFile");

      store.onSync({ a: "foo", b: "", c: "bar" });

      expect(store.toJSON()).toEqual({ a: "foo", b: "", c: "bar" });

      expect(fileSpy).toHaveBeenCalledTimes(1);
    });
  });
});
