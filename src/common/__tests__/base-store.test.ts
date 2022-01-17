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

import mockFs from "mock-fs";
import { BaseStore } from "../base-store";
import { action, comparer, makeObservable, observable, toJS } from "mobx";
import { readFileSync } from "fs";
import { getDisForUnitTesting } from "../../test-utils/get-dis-for-unit-testing";

import directoryForUserDataInjectable
  from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";

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
  @observable a: string;
  @observable b: string;
  @observable c: string;

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
    const dis = getDisForUnitTesting({ doGeneralOverrides: true });

    dis.mainDi.override(directoryForUserDataInjectable, () => "some-user-data-directory");

    await dis.runSetups();

    store = undefined;
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
    store.disableSync();
    TestStore.resetInstance();
    mockFs.restore();
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
