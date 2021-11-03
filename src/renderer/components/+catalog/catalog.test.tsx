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
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Catalog } from "./catalog";
import { createMemoryHistory } from "history";
import { mockWindow } from "../../../../__mocks__/windowMock";
import { kubernetesClusterCategory } from "../../../common/catalog-entities/kubernetes-cluster";
import { catalogCategoryRegistry, CatalogCategoryRegistry, CatalogEntity, CatalogEntityActionContext, CatalogEntityData } from "../../../common/catalog";
import { CatalogEntityRegistry } from "../../../renderer/api/catalog-entity-registry";
import { CatalogEntityDetailRegistry } from "../../../extensions/registries";
import { CatalogEntityItem } from "./catalog-entity-item";
import { CatalogEntityStore } from "./catalog-entity.store";
import { AppPaths } from "../../../common/app-paths";

mockWindow();
jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

AppPaths.init();

jest.mock("./hotbar-toggle-menu-item", () => ({
  HotbarToggleMenuItem: () => <div>menu item</div>,
}));

class MockCatalogEntity extends CatalogEntity {
  public apiVersion = "api";
  public kind = "kind";

  constructor(data: CatalogEntityData, public onRun: (context: CatalogEntityActionContext) => void | Promise<void>) {
    super(data);
  }

  public onContextMenuOpen(): void | Promise<void> {}
  public onSettingsOpen(): void | Promise<void> {}
}

describe("<Catalog />", () => {
  const history = createMemoryHistory();
  const mockLocation = {
    pathname: "",
    search: "",
    state: "",
    hash: "",
  };
  const mockMatch = {
    params: {
      // will be used to match activeCategory
      // need to be the same as property values in kubernetesClusterCategory
      group: "entity.k8slens.dev",
      kind: "KubernetesCluster",
    },
    isExact: true,
    path: "",
    url: "",
  };

  function createMockCatalogEntity(onRun: (context: CatalogEntityActionContext) => void | Promise<void>) {
    return new MockCatalogEntity({
      metadata: {
        uid: "a_catalogEntity_uid",
        name: "a catalog entity",
        labels: {
          test: "label",
        },
      },
      status: {
        phase: "",
      },
      spec: {},
    }, onRun);
  }

  beforeEach(() => {
    CatalogEntityDetailRegistry.createInstance();
    // mock the return of getting CatalogCategoryRegistry.filteredItems
    jest
      .spyOn(catalogCategoryRegistry, "filteredItems", "get")
      .mockImplementation(() => {
        return [kubernetesClusterCategory];
      });

    // we don't care what this.renderList renders in this test case.
    jest.spyOn(Catalog.prototype, "renderList").mockImplementation(() => {
      return <span>empty renderList</span>;
    });
  });

  afterEach(() => {
    CatalogEntityDetailRegistry.resetInstance();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("can use catalogEntityRegistry.addOnBeforeRun to add hooks for catalog entities", (done) => {
    const catalogCategoryRegistry = new CatalogCategoryRegistry();
    const catalogEntityRegistry = new CatalogEntityRegistry(catalogCategoryRegistry);
    const catalogEntityStore = new CatalogEntityStore(catalogEntityRegistry);
    const onRun = jest.fn();
    const catalogEntityItem = new CatalogEntityItem(createMockCatalogEntity(onRun), catalogEntityRegistry);

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      (event) => {
        expect(event.target.getId()).toBe("a_catalogEntity_uid");
        expect(event.target.getName()).toBe("a catalog entity");

        setTimeout(() => {
          expect(onRun).toHaveBeenCalled();
          done();
        }, 500);
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
        catalogEntityStore={catalogEntityStore}
      />,
    );

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));
  });

  it("onBeforeRun prevents event => onRun wont be triggered", (done) => {
    const catalogCategoryRegistry = new CatalogCategoryRegistry();
    const catalogEntityRegistry = new CatalogEntityRegistry(catalogCategoryRegistry);
    const catalogEntityStore = new CatalogEntityStore(catalogEntityRegistry);
    const onRun = jest.fn();
    const catalogEntityItem = new CatalogEntityItem(createMockCatalogEntity(onRun), catalogEntityRegistry);

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      (e) => {
        setTimeout(() => {
          expect(onRun).not.toHaveBeenCalled();
          done();
        }, 500);
        e.preventDefault();
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
        catalogEntityStore={catalogEntityStore}
      />,
    );

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));
  });

  it("addOnBeforeRun throw an exception => onRun will be triggered", (done) => {
    const catalogCategoryRegistry = new CatalogCategoryRegistry();
    const catalogEntityRegistry = new CatalogEntityRegistry(catalogCategoryRegistry);
    const catalogEntityStore = new CatalogEntityStore(catalogEntityRegistry);
    const onRun = jest.fn();
    const catalogEntityItem = new CatalogEntityItem(createMockCatalogEntity(onRun), catalogEntityRegistry);

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      () => {
        setTimeout(() => {
          expect(onRun).toHaveBeenCalled();
          done();
        }, 500);

        throw new Error("error!");
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
        catalogEntityStore={catalogEntityStore}
      />,
    );

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));
  });

  it("addOnRunHook return a promise and does not prevent run event => onRun()", (done) => {
    const catalogCategoryRegistry = new CatalogCategoryRegistry();
    const catalogEntityRegistry = new CatalogEntityRegistry(catalogCategoryRegistry);
    const catalogEntityStore = new CatalogEntityStore(catalogEntityRegistry);
    const onRun = jest.fn(() => done());
    const catalogEntityItem = new CatalogEntityItem(createMockCatalogEntity(onRun), catalogEntityRegistry);

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      async () => {
        // no op
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
        catalogEntityStore={catalogEntityStore}
      />,
    );

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));
  });

  it("addOnRunHook return a promise and prevents event wont be triggered", (done) => {
    const catalogCategoryRegistry = new CatalogCategoryRegistry();
    const catalogEntityRegistry = new CatalogEntityRegistry(catalogCategoryRegistry);
    const catalogEntityStore = new CatalogEntityStore(catalogEntityRegistry);
    const onRun = jest.fn();
    const catalogEntityItem = new CatalogEntityItem(createMockCatalogEntity(onRun), catalogEntityRegistry);

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      async (e) => {
        expect(onRun).not.toBeCalled();

        setTimeout(() => {
          expect(onRun).not.toBeCalled();
          done();
        }, 500);

        e.preventDefault();
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
        catalogEntityStore={catalogEntityStore}
      />,
    );

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));
  });

  it("addOnRunHook return a promise and reject => onRun will be triggered", (done) => {
    const catalogCategoryRegistry = new CatalogCategoryRegistry();
    const catalogEntityRegistry = new CatalogEntityRegistry(catalogCategoryRegistry);
    const catalogEntityStore = new CatalogEntityStore(catalogEntityRegistry);
    const onRun = jest.fn();
    const catalogEntityItem = new CatalogEntityItem(createMockCatalogEntity(onRun), catalogEntityRegistry);

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      async () => {
        setTimeout(() => {
          expect(onRun).toHaveBeenCalled();
          done();
        }, 500);

        throw new Error("rejection!");
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
        catalogEntityStore={catalogEntityStore}
      />,
    );

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));
  });
});
