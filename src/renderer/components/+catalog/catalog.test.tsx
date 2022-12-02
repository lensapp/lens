/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Catalog } from "./catalog";
import type { CatalogEntityActionContext, CatalogEntityData } from "../../../common/catalog";
import { CatalogEntity } from "../../../common/catalog";
import type { CatalogEntityOnBeforeRun, CatalogEntityRegistry } from "../../api/catalog/entity/registry";
import type { CatalogEntityStore } from "./catalog-entity-store/catalog-entity.store";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DiContainer } from "@ogre-tools/injectable";
import catalogEntityStoreInjectable from "./catalog-entity-store/catalog-entity-store.injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import type { AppEvent } from "../../../common/app-event-bus/event-bus";
import appEventBusInjectable from "../../../common/app-event-bus/app-event-bus.injectable";
import { computed } from "mobx";
import broadcastMessageInjectable from "../../../common/ipc/broadcast-message.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { flushPromises } from "../../../common/test-utils/flush-promises";

class MockCatalogEntity extends CatalogEntity {
  public apiVersion = "api";
  public kind = "kind";

  constructor(data: CatalogEntityData, public onRun: (context: CatalogEntityActionContext) => void | Promise<void>) {
    super(data);
  }
}

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

describe("<Catalog />", () => {
  let di: DiContainer;
  let catalogEntityStore: CatalogEntityStore;
  let catalogEntityRegistry: CatalogEntityRegistry;
  let appEventListener: jest.MockedFunction<(event: AppEvent) => void>;
  let onRun: jest.MockedFunction<(context: CatalogEntityActionContext) => void | Promise<void>>;
  let catalogEntityItem: MockCatalogEntity;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    di.override(broadcastMessageInjectable, () => async () => {});

    di.permitSideEffects(getConfigurationFileModelInjectable);

    render = renderFor(di);
    onRun = jest.fn();
    catalogEntityItem = createMockCatalogEntity(onRun);
    catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    appEventListener = jest.fn();
    di.inject(appEventBusInjectable).addListener(appEventListener);

    catalogEntityStore = di.inject(catalogEntityStoreInjectable);
    Object.assign(catalogEntityStore, {
      selectedItem: computed(() => catalogEntityItem),
    });
  });

  describe("can use catalogEntityRegistry.addOnBeforeRun to add hooks for catalog entities", () => {
    let onBeforeRunMock: AsyncFnMock<CatalogEntityOnBeforeRun>;

    beforeEach(() => {
      onBeforeRunMock = asyncFn();

      catalogEntityRegistry.addOnBeforeRun(onBeforeRunMock);

      render(<Catalog />);

      userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));
    });

    it("calls on before run event", () => {
      const target = onBeforeRunMock.mock.calls[0][0].target;

      const actual = { id: target.getId(), name: target.getName() };

      expect(actual).toEqual({
        id: "a_catalogEntity_uid",
        name: "a catalog entity",
      });
    });

    it("does not call onRun yet", () => {
      expect(onRun).not.toHaveBeenCalled();
    });

    it("when before run event resolves, calls onRun", async () => {
      await onBeforeRunMock.resolve();

      expect(onRun).toHaveBeenCalled();
    });
  });

  it("onBeforeRun prevents event => onRun wont be triggered", async () => {
    const onBeforeRunMock = jest.fn((event) => event.preventDefault());

    catalogEntityRegistry.addOnBeforeRun(onBeforeRunMock);

    render(<Catalog />);

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));

    await flushPromises();

    expect(onRun).not.toHaveBeenCalled();
  });

  it("addOnBeforeRun throw an exception => onRun will be triggered", async () => {
    const onBeforeRunMock = jest.fn(() => {
      throw new Error("some error");
    });

    catalogEntityRegistry.addOnBeforeRun(onBeforeRunMock);

    render(<Catalog />);

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));

    await flushPromises();

    expect(onRun).toHaveBeenCalled();
  });

  it("addOnRunHook return a promise and does not prevent run event => onRun()", (done) => {
    onRun.mockImplementation(() => done());

    catalogEntityRegistry.addOnBeforeRun(
      async () => {
        // no op
      },
    );

    render(<Catalog />);

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));
  });

  it("addOnRunHook return a promise and prevents event wont be triggered", async () => {
    const onBeforeRunMock = asyncFn();

    catalogEntityRegistry.addOnBeforeRun(onBeforeRunMock);

    render(<Catalog />);

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));

    onBeforeRunMock.mock.calls[0][0].preventDefault();

    await onBeforeRunMock.resolve();

    expect(onRun).not.toHaveBeenCalled();
  });

  it("addOnRunHook return a promise and reject => onRun will be triggered", async () => {
    const onBeforeRunMock = asyncFn();

    catalogEntityRegistry.addOnBeforeRun(onBeforeRunMock);

    render(<Catalog />);

    userEvent.click(screen.getByTestId("detail-panel-hot-bar-icon"));

    await onBeforeRunMock.reject();

    expect(onRun).toHaveBeenCalled();
  });

  it("emits catalog open AppEvent", () => {
    render(<Catalog />);

    expect(appEventListener).toHaveBeenCalledWith( {
      action: "open",
      name: "catalog",
    });
  });

  it("emits catalog change AppEvent when changing the category", () => {
    render(<Catalog />);

    userEvent.click(screen.getByText("Web Links"));

    expect(appEventListener).toHaveBeenCalledWith({
      action: "change-category",
      name: "catalog",
      params: {
        category: "Web Links",
      },
    });
  });
});
