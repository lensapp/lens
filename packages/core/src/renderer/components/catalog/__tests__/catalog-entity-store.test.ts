/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { CatalogCategoryMetadata, CatalogCategorySpec } from "../../../../common/catalog";
import { CatalogEntity, categoryVersion } from "../../../../common/catalog";
import catalogCategoryRegistryInjectable from "../../../../common/catalog/category-registry.injectable";
import { CatalogCategory } from "../../../api/catalog-entity";
import catalogEntityRegistryInjectable from "../../../api/catalog/entity/registry.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { CatalogEntityStore } from "../catalog-entity-store.injectable";
import catalogEntityStoreInjectable from "../catalog-entity-store.injectable";
import { noop } from "@k8slens/utilities";
import type { CatalogEntityRegistry } from "../../../api/catalog/entity/registry";

class TestEntityOne extends CatalogEntity {
  public static readonly apiVersion: string = "entity.k8slens.dev/v1alpha1";
  public static readonly kind: string = "TestEntityOne";

  public readonly apiVersion = TestEntityOne.apiVersion;
  public readonly kind = TestEntityOne.kind;
}

class TestEntityTwo extends CatalogEntity {
  public static readonly apiVersion: string = "entity.k8slens.dev/v1alpha1";
  public static readonly kind: string = "TestEntityTwo";

  public readonly apiVersion = TestEntityTwo.apiVersion;
  public readonly kind = TestEntityTwo.kind;
}

class TestCategoryOne extends CatalogCategory {
  apiVersion = "catalog.k8slens.dev/v1alpha1";
  kind = "CatalogCategory";
  metadata: CatalogCategoryMetadata = {
    icon: "dash",
    name: "test-one",
  };
  spec: CatalogCategorySpec = {
    group: "entity.k8slens.dev",
    versions: [
      categoryVersion("v1alpha1", TestEntityOne),
    ],
    names: {
      kind: "KubernetesCluster",
    },
  };
}

class TestCategoryTwo extends CatalogCategory {
  apiVersion = "catalog.k8slens.dev/v1alpha1";
  kind = "CatalogCategory";
  metadata: CatalogCategoryMetadata = {
    icon: "dash",
    name: "test-two",
  };
  spec: CatalogCategorySpec = {
    group: "entity.k8slens.dev",
    versions: [
      categoryVersion("v1alpha1", TestEntityTwo),
    ],
    names: {
      kind: "KubernetesCluster",
    },
  };
}

describe("CatalogEntityStore", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();
  });

  describe("getTotalCount", () => {
    let store: CatalogEntityStore;
    let testCategoryOne: TestCategoryOne;
    let testCategoryTwo: TestCategoryTwo;

    beforeEach(() => {
      const entityItems = [
        new TestEntityOne({
          metadata: {
            labels: {},
            name: "my-test-one",
            uid: "1",
          },
          spec: {},
          status: {
            phase: "unknown",
          },
        }),
        new TestEntityOne({
          metadata: {
            labels: {},
            name: "my-test-two",
            uid: "2",
          },
          spec: {},
          status: {
            phase: "unknown",
          },
        }),
        new TestEntityTwo({
          metadata: {
            labels: {},
            name: "my-test-three",
            uid: "3",
          },
          spec: {},
          status: {
            phase: "unknown",
          },
        }),
        new TestEntityTwo({
          metadata: {
            labels: {},
            name: "my-test-four",
            uid: "4",
          },
          spec: {},
          status: {
            phase: "unknown",
          },
        }),
        new TestEntityTwo({
          metadata: {
            labels: {},
            name: "my-test-five",
            uid: "5",
          },
          spec: {},
          status: {
            phase: "unknown",
          },
        }),
      ];

      testCategoryOne = new TestCategoryOne();
      testCategoryTwo = new TestCategoryTwo();

      di.override(catalogCategoryRegistryInjectable, () => ({
        items: [
          testCategoryOne,
          testCategoryTwo,
        ],
      }));
      di.override(catalogEntityRegistryInjectable, () => ({
        onRun: noop,
        filteredItems: entityItems,
        getItemsForCategory: <T extends CatalogEntity>(category: CatalogCategory): T[] => {
          return entityItems.filter(item => category.spec.versions.some(version => item instanceof version.entityClass)) as T[];
        },
      } as CatalogEntityRegistry));

      store = di.inject(catalogEntityStoreInjectable);
    });

    it("given no active category, returns count of all kinds", () => {
      expect(store.getTotalCount()).toBe(5);
    });

    it("given active category is TestCategoryOne, only returns count for those declared kinds", () => {
      store.activeCategory.set(testCategoryOne);
      expect(store.getTotalCount()).toBe(2);
    });

    it("given active category is TestCategoryTwo, only returns count for those declared kinds", () => {
      store.activeCategory.set(testCategoryTwo);
      expect(store.getTotalCount()).toBe(3);
    });
  });
});
