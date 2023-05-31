/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import welcomeCatalogEntityInjectable from "../../../../common/catalog-entities/general-catalog-entities/implementations/welcome-catalog-entity.injectable";
import type { MigrationDeclaration, MigrationStore } from "../../../persistent-storage/common/migrations.injectable";
import { getDiForUnitTesting } from "../../../../main/getDiForUnitTesting";
import type { HotbarData } from "../common/hotbar";
import type { HotbarItem } from "../common/types";
import v640HotbarStoreMigrationInjectable from "./welcome-page-migration.injectable";
import { defaultHotbarCells } from "../common/types";
import { array } from "@k8slens/utilities";

function fillWithEmpties(items: (HotbarItem | null)[])  {
  const emptyHotBarItems = array.filled(defaultHotbarCells, null);

  return [...items, ...emptyHotBarItems.slice(items.length)];
}

function setFirstHotbarItems(store: MigrationStore, items: (HotbarItem | null)[]) {
  const oldHotbars = store.get("hotbars") as HotbarData[];
  // empty hotbar items are nulls
  const itemsWithEmptyCells = fillWithEmpties(items);

  store.set("hotbars", [{ ...oldHotbars[0], items: itemsWithEmptyCells }, ...oldHotbars.slice(1)]);
}

const someItem: HotbarItem = {
  entity: {
    uid: "some-item",
    name: "some-name",
    source: "some-source",
  },
};

describe("hotbar-welcome-page-migration", () => {
  const di = getDiForUnitTesting();
  const welcomePageEntity = di.inject(welcomeCatalogEntityInjectable);

  const welcomeHotbarItem: HotbarItem = {
    entity: {
      uid: welcomePageEntity.metadata.uid,
      name: welcomePageEntity.metadata.name,
      source: welcomePageEntity.metadata.source,
    },
  };

  let migration: MigrationDeclaration;
  let store: MigrationStore;
  const storeModel = new Map();

  beforeEach(() => {
    migration = di.inject(v640HotbarStoreMigrationInjectable);

    storeModel.clear();

    const emptyHotbar: HotbarData = {
      id: "some-id",
      name: "some-name",
      items: [],
    };

    storeModel.set("hotbars", [emptyHotbar]);
    store = {
      path: "some-path",
      get: (key: string) => storeModel.get(key),
      set: (key: string, value: any) => storeModel.set(key, value),
      delete: (key: string) => storeModel.delete(key),
      has: (key: string) => storeModel.has(key),
      clear: () => storeModel.clear(),
    };
  });

  it("given first hotbar is empty, adds welcome page to first place", () => {
    migration.run(store);
    expect(storeModel.get("hotbars")[0].items[0]).toEqual(welcomeHotbarItem);
  });

  it("given first hotbar has items but is not full, adds welcome page to first place", () => {
    setFirstHotbarItems(store, [someItem]);

    migration.run(store);

    expect(storeModel.get("hotbars")[0].items.slice(0, 2)).toEqual([welcomeHotbarItem, someItem]);
  });

  it("given first hotbar is full, does not add welcome page", () => {
    const fullHotbarItems: HotbarItem[] = Array(defaultHotbarCells).fill(someItem);

    setFirstHotbarItems(store, fullHotbarItems);

    migration.run(store);

    expect(storeModel.get("hotbars")[0].items).toEqual(fullHotbarItems);
    expect(storeModel.get("hotbars")[0].items).not.toContain(welcomeHotbarItem);
  });

  it("given first hotbar has already welcome page, does not add welcome page", () => {
    const hotBarItemsWithWelcomePage = fillWithEmpties([someItem, welcomeHotbarItem, someItem]);

    setFirstHotbarItems(store, hotBarItemsWithWelcomePage);
    migration.run(store);
    expect(storeModel.get("hotbars")[0].items).toEqual(hotBarItemsWithWelcomePage);
  });
});
