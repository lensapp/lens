/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { anyObject } from "jest-mock-extended";
import mockFs from "mock-fs";
import type { CatalogEntity, CatalogEntityData, CatalogEntityKindData } from "../catalog";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import appVersionInjectable from "../get-configuration-file-model/app-version/app-version.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import hotbarStoreInjectable from "../hotbars/store.injectable";
import type { HotbarStore } from "../hotbars/store";
import catalogEntityRegistryInjectable from "../../main/catalog/entity-registry.injectable";
import { computed } from "mobx";
import hasCategoryForEntityInjectable from "../catalog/has-category-for-entity.injectable";
import catalogCatalogEntityInjectable from "../catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";
import loggerInjectable from "../logger.injectable";
import type { Logger } from "../logger";

console.log("I am here as reminder against mockfs (and to fix console logging)");

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

describe("HotbarStore", () => {
  let di: DiContainer;
  let hotbarStore: HotbarStore;
  let testCluster: CatalogEntity;
  let minikubeCluster: CatalogEntity;
  let awsCluster: CatalogEntity;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true, overrideHotbarStore: false });

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

    logger = di.inject(loggerInjectable) as jest.Mocked<Logger>;

    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const catalogCatalogEntity = di.inject(catalogCatalogEntityInjectable);

    catalogEntityRegistry.addComputedSource("some-id", computed(() => [
      testCluster,
      minikubeCluster,
      awsCluster,
      catalogCatalogEntity,
    ]));

    di.permitSideEffects(getConfigurationFileModelInjectable);
    di.permitSideEffects(appVersionInjectable);
    di.permitSideEffects(hotbarStoreInjectable);
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("given no previous data in store, running all migrations", () => {
    beforeEach(async () => {
      mockFs();

      await di.runSetups();

      hotbarStore = di.inject(hotbarStoreInjectable);
    });

    describe("load", () => {
      it("loads one hotbar by default", () => {
        expect(hotbarStore.hotbars.length).toEqual(1);
      });
    });

    describe("add", () => {
      it("adds a hotbar", () => {
        hotbarStore.add({ name: "hottest" });
        expect(hotbarStore.hotbars.length).toEqual(2);
      });
    });

    describe("hotbar items", () => {
      it("initially creates 12 empty cells", () => {
        expect(hotbarStore.getActive().items.length).toEqual(12);
      });

      it("initially adds catalog entity as first item", () => {
        expect(hotbarStore.getActive().items[0]?.entity.name).toEqual("Catalog");
      });

      it("adds items", () => {
        hotbarStore.addToHotbar(testCluster);
        const items = hotbarStore.getActive().items.filter(Boolean);

        expect(items.length).toEqual(2);
      });

      it("removes items", () => {
        hotbarStore.addToHotbar(testCluster);
        hotbarStore.removeFromHotbar("some-test-id");
        hotbarStore.removeFromHotbar("catalog-entity");
        const items = hotbarStore.getActive().items.filter(Boolean);

        expect(items).toStrictEqual([]);
      });

      it("does nothing if removing with invalid uid", () => {
        hotbarStore.addToHotbar(testCluster);
        hotbarStore.removeFromHotbar("invalid uid");
        const items = hotbarStore.getActive().items.filter(Boolean);

        expect(items.length).toEqual(2);
      });

      it("moves item to empty cell", () => {
        hotbarStore.addToHotbar(testCluster);
        hotbarStore.addToHotbar(minikubeCluster);
        hotbarStore.addToHotbar(awsCluster);

        expect(hotbarStore.getActive().items[6]).toBeNull();

        hotbarStore.restackItems(1, 5);

        expect(hotbarStore.getActive().items[5]).toBeTruthy();
        expect(hotbarStore.getActive().items[5]?.entity.uid).toEqual("some-test-id");
      });

      it("moves items down", () => {
        hotbarStore.addToHotbar(testCluster);
        hotbarStore.addToHotbar(minikubeCluster);
        hotbarStore.addToHotbar(awsCluster);

        // aws -> catalog
        hotbarStore.restackItems(3, 0);

        const items = hotbarStore.getActive().items.map(item => item?.entity.uid || null);

        expect(items.slice(0, 4)).toEqual(["some-aws-id", "catalog-entity", "some-test-id", "some-minikube-id"]);
      });

      it("moves items up", () => {
        hotbarStore.addToHotbar(testCluster);
        hotbarStore.addToHotbar(minikubeCluster);
        hotbarStore.addToHotbar(awsCluster);

        // test -> aws
        hotbarStore.restackItems(1, 3);

        const items = hotbarStore.getActive().items.map(item => item?.entity.uid || null);

        expect(items.slice(0, 4)).toEqual(["catalog-entity", "some-minikube-id", "some-aws-id", "some-test-id"]);
      });

      it("logs an error if cellIndex is out of bounds", () => {
        hotbarStore.add({ name: "hottest", id: "hottest" });
        hotbarStore.setActiveHotbar("hottest");

        hotbarStore.addToHotbar(testCluster, -1);
        expect(logger.error).toBeCalledWith("[HOTBAR-STORE]: cannot pin entity to hotbar outside of index range", anyObject());

        hotbarStore.addToHotbar(testCluster, 12);
        expect(logger.error).toBeCalledWith("[HOTBAR-STORE]: cannot pin entity to hotbar outside of index range", anyObject());

        hotbarStore.addToHotbar(testCluster, 13);
        expect(logger.error).toBeCalledWith("[HOTBAR-STORE]: cannot pin entity to hotbar outside of index range", anyObject());
      });

      it("throws an error if getId is invalid or returns not a string", () => {
        expect(() => hotbarStore.addToHotbar({} as any)).toThrowError(TypeError);
        expect(() => hotbarStore.addToHotbar({ getId: () => true } as any)).toThrowError(TypeError);
      });

      it("throws an error if getName is invalid or returns not a string", () => {
        expect(() => hotbarStore.addToHotbar({ getId: () => "" } as any)).toThrowError(TypeError);
        expect(() => hotbarStore.addToHotbar({ getId: () => "", getName: () => 4 } as any)).toThrowError(TypeError);
      });

      it("does nothing when item moved to same cell", () => {
        hotbarStore.addToHotbar(testCluster);
        hotbarStore.restackItems(1, 1);

        expect(hotbarStore.getActive().items[1]?.entity.uid).toEqual("some-test-id");
      });

      it("new items takes first empty cell", () => {
        hotbarStore.addToHotbar(testCluster);
        hotbarStore.addToHotbar(awsCluster);
        hotbarStore.restackItems(0, 3);
        hotbarStore.addToHotbar(minikubeCluster);

        expect(hotbarStore.getActive().items[0]?.entity.uid).toEqual("some-minikube-id");
      });

      it("throws if invalid arguments provided", () => {
        // Prevent writing to stderr during this render.
        const { error, warn } = console;

        console.error = jest.fn();
        console.warn = jest.fn();

        hotbarStore.addToHotbar(testCluster);

        expect(() => hotbarStore.restackItems(-5, 0)).toThrow();
        expect(() => hotbarStore.restackItems(2, -1)).toThrow();
        expect(() => hotbarStore.restackItems(14, 1)).toThrow();
        expect(() => hotbarStore.restackItems(11, 112)).toThrow();

        // Restore writing to stderr.
        console.error = error;
        console.warn = warn;
      });

      it("checks if entity already pinned to hotbar", () => {
        hotbarStore.addToHotbar(testCluster);

        expect(hotbarStore.isAddedToActive(testCluster)).toBeTruthy();
        expect(hotbarStore.isAddedToActive(awsCluster)).toBeFalsy();
      });
    });
  });

  describe("given data from 5.0.0-beta.3 and version being 5.0.0-beta.10", () => {
    beforeEach(async () => {
      const configurationToBeMigrated = {
        "some-electron-app-path-for-user-data": {
          "lens-hotbar-store.json": JSON.stringify({
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
          }),
        },
      };

      mockFs(configurationToBeMigrated);

      di.override(appVersionInjectable, () => "5.0.0-beta.10");

      await di.runSetups();

      hotbarStore = di.inject(hotbarStoreInjectable);
    });

    it("allows to retrieve a hotbar", () => {
      const hotbar = hotbarStore.findById("3caac17f-aec2-4723-9694-ad204465d935");

      expect(hotbar?.id).toBe("3caac17f-aec2-4723-9694-ad204465d935");
    });

    it("clears cells without entity", () => {
      const items = hotbarStore.hotbars[0].items;

      expect(items[2]).toBeNull();
    });

    it("adds extra data to cells with according entity", () => {
      const items = hotbarStore.hotbars[0].items;

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
