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

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { NamespaceSelectFilter } from "../namespace-select-filter";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { DiRender, renderFor } from "../../test-utils/renderFor";
import { ThemeStore } from "../../../theme.store";
import { UserStore } from "../../../../common/user-store";
import namespaceStoreInjectable from "../namespace.store.injectable";
import { NamespaceStore } from "../namespace.store";
import { AppPaths } from "../../../../common/app-paths";
import { Namespace } from "../../../../common/k8s-api/endpoints";
import { StorageHelper } from "../../../utils";
import { observable } from "mobx";

jest.mock("electron", () => ({ // TODO: remove mocks
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

describe("NamespaceSelectFilter", () => {
  let render: DiRender;
  let namespaceStore: NamespaceStore;

  beforeAll(async () => { // TODO: remove beforeAll
    await AppPaths.init();

    UserStore.resetInstance();
    UserStore.createInstance();

    ThemeStore.resetInstance();
    ThemeStore.createInstance();
  });

  beforeEach(() => {
    const di = getDiForUnitTesting();
    const storage = observable({
      initialized: true,
      loaded: true,
      data: {} as Record<string, any>,
    });
    const storageHelper = new StorageHelper<string[]>("namespace_select", {
      autoInit: true,
      defaultValue: undefined,
      storage: {
        async getItem(key: string) {
          return storage.data[key];
        },
        setItem(key: string, value: any) {
          storage.data[key] = value;
        },
        removeItem(key: string) {
          delete storage.data[key];
        },
      },
    });

    namespaceStore = new NamespaceStore({
      storage: storageHelper,
      autoInit: false,
    });
    namespaceStore.resetSelection();
    di.override(namespaceStoreInjectable, namespaceStore);

    render = renderFor(di);
  });

  it ("renders without errors using defaults", async () => {
    expect(() => {
      render(<><NamespaceSelectFilter /></>);
    }).not.toThrow();
  });

  it ("renders all namespaces by default", async () => {
    const { getByTestId } = render(<><NamespaceSelectFilter /></>);
    const select = getByTestId("namespace-select-filter");

    expect(select.getElementsByClassName("Select__placeholder")[0].innerHTML).toEqual("All namespaces");
  });

  it ("renders selected namespaces", async () => {
    namespaceStore.items.replace([
      new Namespace({ kind: "Namespace", apiVersion: "v1", metadata: { name: "one", uid: "one", resourceVersion: "1" }}),
      new Namespace({ kind: "Namespace", apiVersion: "v1", metadata: { name: "two", uid: "two", resourceVersion: "1" }}),
      new Namespace({ kind: "Namespace", apiVersion: "v1", metadata: { name: "three", uid: "three", resourceVersion: "1" }}),
    ]);

    namespaceStore.selectNamespaces(["two", "three"]);

    const { getByTestId } = render(<><NamespaceSelectFilter /></>);
    const select = getByTestId("namespace-select-filter");

    expect(select.getElementsByClassName("Select__placeholder")[0].innerHTML).toEqual("Namespaces: two, three");
  });

  it ("allows to select namespaces", async () => {
    namespaceStore.items.replace([
      new Namespace({ kind: "Namespace", apiVersion: "v1", metadata: { name: "one", uid: "one", resourceVersion: "1" }}),
      new Namespace({ kind: "Namespace", apiVersion: "v1", metadata: { name: "two", uid: "two", resourceVersion: "1" }}),
      new Namespace({ kind: "Namespace", apiVersion: "v1", metadata: { name: "three", uid: "three", resourceVersion: "1" }}),
    ]);

    const { container  } = render(<><NamespaceSelectFilter showIcons={false} /></>);

    fireEvent.click(container.querySelector(".Select__placeholder"));

    await waitFor(() => screen.getByText("one"));
    fireEvent.click(screen.getByText("one"));

    expect(container.querySelector(".Select__placeholder").innerHTML).toEqual("Namespace: one");
    expect(namespaceStore.selectedNames).toEqual(new Set(["one"]));
  });
});
