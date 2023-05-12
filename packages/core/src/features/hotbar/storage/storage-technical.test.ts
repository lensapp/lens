/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { anyObject } from "jest-mock-extended";
import type { CatalogEntity, CatalogEntityData, CatalogEntityKindData } from "../../../common/catalog";
import { getDiForUnitTesting } from "../../../main/getDiForUnitTesting";
import type { DiContainer } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "../../../main/catalog/entity-registry.injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import hasCategoryForEntityInjectable from "../../../common/catalog/has-category-for-entity.injectable";
import catalogCatalogEntityInjectable from "../../../common/catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import type { Logger } from "@k8slens/logger";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import storeMigrationVersionInjectable from "../../../common/vars/store-migration-version.injectable";
import writeJsonSyncInjectable from "../../../common/fs/write-json-sync.injectable";
import type { SetAsActiveHotbar } from "./common/set-as-active.injectable";
import setAsActiveHotbarInjectable from "./common/set-as-active.injectable";
import hotbarsPersistentStorageInjectable from "./common/storage.injectable";
import type { Hotbar } from "./common/hotbar";
import hotbarsInjectable from "./common/hotbars.injectable";
import activeHotbarInjectable from "./common/active.injectable";
import type { AddHotbar } from "./common/add.injectable";
import type { GetHotbarById } from "./common/get-by-id.injectable";
import getHotbarByIdInjectable from "./common/get-by-id.injectable";
import addHotbarInjectable from "./common/add.injectable";
import { defaultHotbarCells } from "./common/types";

function getMockCatalogEntity(data: Partial<CatalogEntityData> & CatalogEntityKindData): CatalogEntity {
  return {
    getName: jest.fn(() => data.metadata?.name),
    getId: jest.fn(() => data.metadata?.uid),
    getSource: jest.fn(() => data.metadata?.source ?? "unknown"),
    isEnabled: jest.fn(() => data.status?.enabled ?? true),
    onContextMenuOpen: jest.fn(),
    onSettingsOpen: jest.fn(),
    metadata: {},
    spec: {},
    status: {},
    ...data,
  } as CatalogEntity;
}

describe("Hotbars technical tests", () => {
  let di: DiContainer;
  let testCluster: CatalogEntity;
  let minikubeCluster: CatalogEntity;
  let awsCluster: CatalogEntity;
  let loggerMock: jest.Mocked<Logger>;
  let setAsActiveHotbar: SetAsActiveHotbar;
  let hotbars: IComputedValue<Hotbar[]>;
  let activeHotbar: IComputedValue<Hotbar | undefined>;
  let addHotbar: AddHotbar;
  let getHotbarById: GetHotbarById;

  beforeEach(async () => {
    di = getDiForUnitTesting();

    testCluster = getMockCatalogEntity({
      apiVersion: "v1",
      kind: "Cluster",
      status: {
        phase: "Running",
      },
      metadata: {
        uid: "some-test-id",
        name: "my-test-cluster",
        source: "local",
        labels: {},
      },
    });
    minikubeCluster = getMockCatalogEntity({
      apiVersion: "v1",
      kind: "Cluster",
      status: {
        phase: "Running",
      },
      metadata: {
        uid: "some-minikube-id",
        name: "my-minikube-cluster",
        source: "local",
        labels: {},
      },
    });
    awsCluster = getMockCatalogEntity({
      apiVersion: "v1",
      kind: "Cluster",
      status: {
        phase: "Running",
      },
      metadata: {
        uid: "some-aws-id",
        name: "my-aws-cluster",
        source: "local",
        labels: {},
      },
    });

    di.override(hasCategoryForEntityInjectable, () => () => true);

    loggerMock = {
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      silly: jest.fn(),
    };

    di.override(loggerInjectionToken, () => loggerMock);

    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");

    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const catalogCatalogEntity = di.inject(catalogCatalogEntityInjectable);

    catalogEntityRegistry.addComputedSource("some-id", computed(() => [
      testCluster,
      minikubeCluster,
      awsCluster,
      catalogCatalogEntity,
    ]));

    setAsActiveHotbar = di.inject(setAsActiveHotbarInjectable);
    hotbars = di.inject(hotbarsInjectable);
    activeHotbar = di.inject(activeHotbarInjectable);
    addHotbar = di.inject(addHotbarInjectable);
    getHotbarById = di.inject(getHotbarByIdInjectable);
  });

  describe("given no previous data in store, running all migrations", () => {
    beforeEach(() => {
      di.override(storeMigrationVersionInjectable, () => "9999.0.0");
      di.inject(hotbarsPersistentStorageInjectable).loadAndStartSyncing();
    });

    describe("load", () => {
      it("loads one hotbar by default", () => {
        expect(hotbars.get().length).toEqual(1);
      });
    });

    describe("add", () => {
      it("adds a hotbar", () => {
        addHotbar({ name: "hottest" });
        expect(hotbars.get().length).toEqual(2);
      });
    });

    describe("hotbar items", () => {
      it("initially creates default number of empty cells", () => {
        expect(activeHotbar.get()?.items?.length).toEqual(defaultHotbarCells);
      });

      it("initially adds welcome page entity as first item", () => {
        expect(activeHotbar.get()?.items[0]?.entity.name).toEqual("Welcome Page");
      });

      it("initially adds catalog entity as second item", () => {
        expect(activeHotbar.get()?.items[1]?.entity.name).toEqual("Catalog");
      });

      it("adds items", () => {
        activeHotbar.get()?.addEntity(testCluster);
        const items = activeHotbar.get()?.items.filter(Boolean);

        expect(items?.length).toEqual(3);
      });

      it("removes items", () => {
        activeHotbar.get()?.addEntity(testCluster);
        activeHotbar.get()?.removeEntity("some-test-id");
        activeHotbar.get()?.removeEntity("catalog-entity");
        activeHotbar.get()?.removeEntity("welcome-page-entity");
        const items = activeHotbar.get()?.items.filter(Boolean);

        expect(items).toStrictEqual([]);
      });

      it("does nothing if removing with invalid uid", () => {
        activeHotbar.get()?.addEntity(testCluster);
        activeHotbar.get()?.removeEntity("invalid uid");
        const items = activeHotbar.get()?.items.filter(Boolean);

        expect(items?.length).toEqual(3);
      });

      it("moves item to empty cell", () => {
        activeHotbar.get()?.addEntity(testCluster);
        activeHotbar.get()?.addEntity(minikubeCluster);
        activeHotbar.get()?.addEntity(awsCluster);

        expect(activeHotbar.get()?.items[6]).toBeNull();

        activeHotbar.get()?.restack(2, 5);

        expect(activeHotbar.get()?.items[5]).toBeTruthy();
        expect(activeHotbar.get()?.items[5]?.entity.uid).toEqual("some-test-id");
      });

      it("moves items down", () => {
        activeHotbar.get()?.addEntity(testCluster);
        activeHotbar.get()?.addEntity(minikubeCluster);
        activeHotbar.get()?.addEntity(awsCluster);

        // aws -> catalog
        activeHotbar.get()?.restack(4, 0);

        const items = activeHotbar.get()?.items.map(item => item?.entity.uid || null);

        expect(items?.slice(0, 5)).toEqual(["some-aws-id", "welcome-page-entity", "catalog-entity", "some-test-id", "some-minikube-id"]);
      });

      it("moves items up", () => {
        activeHotbar.get()?.addEntity(testCluster);
        activeHotbar.get()?.addEntity(minikubeCluster);
        activeHotbar.get()?.addEntity(awsCluster);

        // test -> aws
        activeHotbar.get()?.restack(2, 4);

        const items = activeHotbar.get()?.items.map(item => item?.entity.uid || null);

        expect(items?.slice(0, 5)).toEqual(["welcome-page-entity", "catalog-entity", "some-minikube-id", "some-aws-id", "some-test-id"]);
      });

      it("logs an error if cellIndex is out of bounds", () => {
        addHotbar({ name: "hottest", id: "hottest" });
        setAsActiveHotbar("hottest");

        activeHotbar.get()?.addEntity(testCluster, -1);
        expect(loggerMock.error).toBeCalledWith("[HOTBAR]: cannot pin entity to hotbar outside of index range", anyObject());

        activeHotbar.get()?.addEntity(testCluster, 12);
        expect(loggerMock.error).toBeCalledWith("[HOTBAR]: cannot pin entity to hotbar outside of index range", anyObject());

        activeHotbar.get()?.addEntity(testCluster, 13);
        expect(loggerMock.error).toBeCalledWith("[HOTBAR]: cannot pin entity to hotbar outside of index range", anyObject());
      });

      it("throws an error if getId is invalid or returns not a string", () => {
        expect(() => activeHotbar.get()?.addEntity({} as any)).toThrowError(TypeError);
        expect(() => activeHotbar.get()?.addEntity({ getId: () => true } as any)).toThrowError(TypeError);
      });

      it("throws an error if getName is invalid or returns not a string", () => {
        expect(() => activeHotbar.get()?.addEntity({ getId: () => "" } as any)).toThrowError(TypeError);
        expect(() => activeHotbar.get()?.addEntity({ getId: () => "", getName: () => 4 } as any)).toThrowError(TypeError);
      });

      it("does nothing when item moved to same cell", () => {
        activeHotbar.get()?.addEntity(testCluster);
        activeHotbar.get()?.restack(2, 2);

        expect(activeHotbar.get()?.items[2]?.entity.uid).toEqual("some-test-id");
      });

      it("new items takes first empty cell", () => {
        activeHotbar.get()?.addEntity(testCluster);
        activeHotbar.get()?.addEntity(awsCluster);
        activeHotbar.get()?.restack(0, 4);
        activeHotbar.get()?.addEntity(minikubeCluster);

        expect(activeHotbar.get()?.items[0]?.entity.uid).toEqual("some-minikube-id");
      });

      it("throws if invalid arguments provided", () => {
        activeHotbar.get()?.addEntity(testCluster);

        expect(() => activeHotbar.get()?.restack(-5, 0)).toThrow();
        expect(() => activeHotbar.get()?.restack(2, -1)).toThrow();
        expect(() => activeHotbar.get()?.restack(14, 1)).toThrow();
        expect(() => activeHotbar.get()?.restack(11, 112)).toThrow();
      });

      it("checks if entity already pinned to hotbar", () => {
        activeHotbar.get()?.addEntity(testCluster);

        expect(activeHotbar.get()?.hasEntity(testCluster.getId())).toBeTruthy();
        expect(activeHotbar.get()?.hasEntity(awsCluster.getId())).toBeFalsy();
      });
    });
  });

  describe("given data from 5.0.0-beta.3 and version being 5.0.0-beta.10", () => {
    beforeEach(() => {
      const writeJsonSync = di.inject(writeJsonSyncInjectable);

      writeJsonSync("/some-directory-for-user-data/lens-hotbar-store.json", {
        __internal__: {
          migrations: {
            version: "5.0.0-beta.3",
          },
        },
        hotbars: [
          {
            id: "3caac17f-aec2-4723-9694-ad204465d935",
            name: "myhotbar",
            items: [
              {
                entity: {
                  uid: "some-aws-id",
                },
              },
              {
                entity: {
                  uid: "55b42c3c7ba3b04193416cda405269a5",
                },
              },
              {
                entity: {
                  uid: "176fd331968660832f62283219d7eb6e",
                },
              },
              {
                entity: {
                  uid: "61c4fb45528840ebad1badc25da41d14",
                  name: "user1-context",
                  source: "local",
                },
              },
              {
                entity: {
                  uid: "27d6f99fe9e7548a6e306760bfe19969",
                  name: "foo2",
                  source: "local",
                },
              },
              null,
              {
                entity: {
                  uid: "c0b20040646849bb4dcf773e43a0bf27",
                  name: "multinode-demo",
                  source: "local",
                },
              },
              null,
              null,
              null,
              null,
              null,
            ],
          },
        ],
      });

      di.override(storeMigrationVersionInjectable, () => "5.0.0-beta.10");

      di.inject(hotbarsPersistentStorageInjectable).loadAndStartSyncing();
    });

    it("allows to retrieve a hotbar", () => {
      const hotbar = getHotbarById("3caac17f-aec2-4723-9694-ad204465d935");

      expect(hotbar?.id).toBe("3caac17f-aec2-4723-9694-ad204465d935");
    });

    it("clears cells without entity", () => {
      const items = hotbars.get()[0].items;

      expect(items[2]).toBeNull();
    });

    it("adds extra data to cells with according entity", () => {
      const items = hotbars.get()[0].items;

      expect(items[0]).toEqual({
        entity: {
          name: "my-aws-cluster",
          source: "local",
          uid: "some-aws-id",
        },
      });
    });
  });
});
