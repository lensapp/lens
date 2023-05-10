/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import welcomeCatalogEntityInjectable from "../../../../common/catalog-entities/general-catalog-entities/implementations/welcome-catalog-entity.injectable";
import type { MigrationDeclaration, MigrationStore } from "../../../../common/persistent-storage/migrations.injectable";
import { getDiForUnitTesting } from "../../../../main/getDiForUnitTesting";
import type { HotbarData } from "../common/hotbar";
import type { HotbarItem } from "../common/types";
import v640HotbarStoreMigrationInjectable from "./welcome-page-migration.injectable";
import { defaultHotbarCells } from "../common/types";

function setFirstHotbarItems(store: MigrationStore, items: HotbarItem[]) {
  const oldHotbars = store.get("hotbars") as HotbarData[];

  store.set("hotbars", [{ ...oldHotbars[0], items }, ...oldHotbars.slice(1)]);
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
    expect(storeModel.get("hotbars")[0].items).toEqual([welcomeHotbarItem]);
  });

  it("given first hotbar has items but is not full, adds welcome page to first place", () => {
    setFirstHotbarItems(store, [someItem]);

    migration.run(store);

    expect(storeModel.get("hotbars")[0].items).toEqual([welcomeHotbarItem, someItem]);
  });

  it("given first hotbar is full, does not add welcome page", () => {
    const fullHotbarItems: HotbarItem[] = Array(defaultHotbarCells).fill(someItem);

    setFirstHotbarItems(store, fullHotbarItems);

    migration.run(store);

    expect(storeModel.get("hotbars")[0].items).toEqual(fullHotbarItems);
    expect(storeModel.get("hotbars")[0].items).not.toContain(welcomeHotbarItem);
  });

  it("given first hotbar has already welcome page, does not add welcome page", () => {
    const hotBarItemsWithWelcomePage = [someItem, welcomeHotbarItem, someItem];

    setFirstHotbarItems(store, hotBarItemsWithWelcomePage);
    migration.run(store);
    expect(storeModel.get("hotbars")[0].items).toEqual(hotBarItemsWithWelcomePage);
  });
});
