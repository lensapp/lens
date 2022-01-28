/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Catalog } from "../catalog";
import { createMemoryHistory, MemoryHistory } from "history";
import { mockWindow } from "../../../../../__mocks__/windowMock";
import { CatalogCategory, CatalogCategorySpec, CatalogEntity } from "../../../../common/catalog";
import type { CatalogEntityRegistry } from "../../../catalog/entity-registry";
import type { CatalogEntityStore } from "../entity.store";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import catalogEntityStoreInjectable from "../entity.store.injectable";
import catalogEntityRegistryInjectable from "../../../catalog/entity-registry.injectable";
import addToActiveHotbarInjectable from "../../../../common/hotbar-store/add-to-active-hotbar.injectable";
import { noop } from "../../../utils";
import removeByIdFromActiveHotbarInjectable from "../../../../common/hotbar-store/remove-from-active-hotbar.injectable";
import { getStorageLayerMock } from "../../../utils/__mocks__/storage-helper";
import isTableColumnHiddenInjectable from "../../../../common/user-preferences/is-table-column-hidden.injectable";
import toggleTableColumnVisibilityInjectable from "../../../../common/user-preferences/toggle-table-column-visibility.injectable";
import activeThemeInjectable from "../../../themes/active-theme.injectable";
import { computed } from "mobx";
import type { Theme } from "../../../themes/store";
import catalogCategoryRegistryInjectable from "../../../catalog/category-registry.injectable";
import isItemInActiveHotbarInjectable from "../../../../common/hotbar-store/is-added-to-active-hotbar.injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

function timeout(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

mockWindow();

class MockCatalogEntityCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public readonly metadata = {
    name: "Mocks",
    icon: "question_mark",
  };
  public readonly spec: CatalogCategorySpec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: MockCatalogEntity,
      },
    ],
    names: {
      kind: "Mock",
    },
  };
}

class MockCatalogEntity extends CatalogEntity {
  public static readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public static readonly kind = "Mock";

  public readonly apiVersion = MockCatalogEntity.apiVersion;
  public readonly kind = MockCatalogEntity.kind;

  public onContextMenuOpen(): void | Promise<void> {}
  public onSettingsOpen(): void | Promise<void> {}

  public onRun = jest.fn();
}

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

function createMockCatalogEntity() {
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
  });
}

describe("<Catalog />", () => {
  let history: MemoryHistory;
  let render: DiRender;
  let di: ConfigurableDependencyInjectionContainer;
  let catalogEntityStore: CatalogEntityStore;
  let catalogEntityRegistry: CatalogEntityRegistry;

  beforeEach(() => {
    history = createMemoryHistory();
    di = getDiForUnitTesting();
    render = renderFor(di);

    di.override(createStorageInjectable, () => getStorageLayerMock);
    di.override(addToActiveHotbarInjectable, () => noop);
    di.override(removeByIdFromActiveHotbarInjectable, () => noop);
    di.override(isItemInActiveHotbarInjectable, () => () => false);
    di.override(isTableColumnHiddenInjectable, () => () => false);
    di.override(toggleTableColumnVisibilityInjectable, () => noop);
    di.override(activeThemeInjectable, () => computed(() => ({
      type: "dark",
    } as Theme)));
    di.override(loggerInjectable, () => ({
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      silly: jest.fn(),
      warn: jest.fn(),
    }));

    di.inject(catalogCategoryRegistryInjectable)
      .add(new MockCatalogEntityCategory());

    catalogEntityStore = di.inject(catalogEntityStoreInjectable);
    catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
  });

  it("can use catalogEntityRegistry.addOnBeforeRun to add hooks for catalog entities", async () => {
    expect.assertions(3);
    const catalogEntityItem = createMockCatalogEntity();

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      (event) => {
        expect(event.target.getId()).toBe("a_catalogEntity_uid");
        expect(event.target.getName()).toBe("a catalog entity");

        setTimeout(() => {
          expect(catalogEntityItem.onRun).toHaveBeenCalled();
        }, 500);
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
      />,
    );

    userEvent.click(await screen.findByTestId("detail-panel-hot-bar-icon"));
    await timeout(1000);
  });

  it("onBeforeRun prevents event => onRun wont be triggered", async () => {
    expect.assertions(1);
    const catalogEntityItem = createMockCatalogEntity();

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      (e) => {
        setTimeout(() => {
          expect(catalogEntityItem.onRun).not.toHaveBeenCalled();
        }, 500);
        e.preventDefault();
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
      />,
    );

    userEvent.click(await screen.findByTestId("detail-panel-hot-bar-icon"));
    await timeout(1000);
  });

  it("addOnBeforeRun throw an exception => onRun will be triggered", async () => {
    expect.assertions(1);
    const catalogEntityItem = createMockCatalogEntity();

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      () => {
        setTimeout(() => {
          expect(catalogEntityItem.onRun).toHaveBeenCalled();
        }, 500);

        throw new Error("error!");
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
      />,
    );

    userEvent.click(await screen.findByTestId("detail-panel-hot-bar-icon"));
    await timeout(1000);
  });

  it("addOnRunHook return a promise that doesn't settle does not prevent run event => onRun()", async () => {
    expect.assertions(1);
    const catalogEntityItem = createMockCatalogEntity();

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      () => {
        setTimeout(() => {
          expect(catalogEntityItem.onRun).toHaveBeenCalled();
        }, 10_500);

        return new Promise<void>(noop);
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
      />,
    );

    userEvent.click(await screen.findByTestId("detail-panel-hot-bar-icon"));
    await timeout(12_000);
  }, 15_000);

  it("addOnRunHook return a promise and prevents event wont be triggered", async () => {
    expect.assertions(2);
    const catalogEntityItem = createMockCatalogEntity();

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      (e) => {
        expect(catalogEntityItem.onRun).not.toBeCalled();

        setTimeout(() => {
          expect(catalogEntityItem.onRun).not.toBeCalled();
        }, 500);

        e.preventDefault();
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
      />,
    );

    userEvent.click(await screen.findByTestId("detail-panel-hot-bar-icon"));
    await timeout(1000);
  });

  it("addOnRunHook return a promise and reject => onRun will be triggered", async () => {
    expect.assertions(1);
    const catalogEntityItem = createMockCatalogEntity();

    // mock as if there is a selected item > the detail panel opens
    jest
      .spyOn(catalogEntityStore, "selectedItem", "get")
      .mockImplementation(() => catalogEntityItem);

    catalogEntityRegistry.addOnBeforeRun(
      () => {
        setTimeout(() => {
          expect(catalogEntityItem.onRun).toHaveBeenCalled();
        }, 500);

        throw new Error("rejection!");
      },
    );

    render(
      <Catalog
        history={history}
        location={mockLocation}
        match={mockMatch}
      />,
    );

    userEvent.click(await screen.findByTestId("detail-panel-hot-bar-icon"));
    await timeout(1000);
  });
});
