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

import { jest } from "@jest/globals";
import { observable, reaction, toJS } from "mobx";
import { StorageHelper } from "../../../utils";
import { DockTabStore } from "../dock-tab.store";
import type { TabId } from "../dock.store";

type UtilsModule = typeof import("../../../utils");

jest.mock("../../../utils", () => {
  const localStorageMock = observable.map<TabId, unknown>({});
  const Utils = jest.requireActual("../../../utils") as UtilsModule;

  // Partial module mocking
  // https://jestjs.io/docs/mock-functions#mocking-partials
  return {
    ...Utils,
    createStorage: jest.fn((key: string, defaultValue: unknown) => {
      return new StorageHelper(key, {
        defaultValue,
        storage: {
          getItem(key: TabId) {
            localStorageMock.get(key);
          },
          setItem(key: TabId, value: unknown) {
            localStorageMock.set(key, value);
          },
          removeItem(key: TabId) {
            localStorageMock.delete(key);
          },
        },
      });
    }),
  };
});

// TODO: add more tests
describe(`[DockTabStore]: dock tabs data class-helper`, () => {
  test("options.autoInit = true (default)", async () => {
    const tabStorage = new DockTabStore({ autoInit: true });

    expect(tabStorage.initialized).toBeFalsy();
    expect(tabStorage.dataReady).toBeFalsy();
    await tabStorage.whenReady;

    expect(tabStorage.dataReady).toBeTruthy();
    expect(tabStorage.initialized).toBeTruthy();
  });

  test("options.autoInit = false", async () => {
    const tabStorage = new DockTabStore({ autoInit: false });

    await tabStorage.whenReady;
    expect(tabStorage.dataReady).toBeTruthy();
    expect(tabStorage.initialized).toBeFalsy();

    await tabStorage.init();
    expect(tabStorage.initialized).toBeTruthy();
  });

  test(`dockTabStore.getData(tabId) is deeply observable`, async () => {
    interface TabDataStorageShape {
      [key: string]: any;
      account: {
        name: string;
        description?: string;
      }
    }

    const tabDataHistory: TabDataStorageShape[] = [];
    const randomTabId = getRandomTabId();
    const tabStorage = new DockTabStore<TabDataStorageShape>();

    await tabStorage.whenReady;

    reaction(() => toJS(tabStorage.getData(randomTabId)),
      data => tabDataHistory.push(data),
    );

    tabStorage.setData(randomTabId, { account: { name: "test" } });

    expect(tabStorage.getData(randomTabId)).toBe(tabStorage.data[randomTabId]);
    expect(tabStorage.getData(randomTabId).account.name).toBe("test");
    tabStorage.data[randomTabId].account.name = "updated"; // update deep in the tree

    expect(tabDataHistory.length).toBe(2);
    expect(tabDataHistory[1].account.name).toBe("updated");
  });

});

export function getRandomTabId(): TabId {
  return `tab-id-${(Math.random() * Date.now()).toString(16)}`;
}

