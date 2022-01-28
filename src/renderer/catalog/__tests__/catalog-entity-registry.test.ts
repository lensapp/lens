/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntityRegistry } from "../entity-registry";
import { CatalogCategory, CatalogCategoryRegistry } from "../../../common/catalog";
import { KubernetesCluster, WebLink } from "../../../common/catalog-entities";
import { observable } from "mobx";
import catalogEntityRegistryInjectable from "../entity-registry.injectable";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import catalogCategoryRegistryInjectable from "../category-registry.injectable";

class FooBarCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "FooBars",
    icon: "broken",
  };
  public spec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: WebLink,
      },
    ],
    names: {
      kind: "FooBar",
    },
  };
}
const entity = new WebLink({
  metadata: {
    uid: "test",
    name: "test-link",
    source: "test",
    labels: {},
  },
  spec: {
    url: "https://k8slens.dev",
  },
  status: {
    phase: "available",
  },
});
const entity2 = new WebLink({
  metadata: {
    uid: "test2",
    name: "test-link",
    source: "test",
    labels: {},
  },
  spec: {
    url: "https://k8slens.dev",
  },
  status: {
    phase: "available",
  },
});
const entitykc = new KubernetesCluster({
  metadata: {
    uid: "test3",
    name: "test-link",
    source: "test",
    labels: {},
  },
  spec: {
    kubeconfigPath: "",
    kubeconfigContext: "",
  },
  status: {
    phase: "connected",
  },
});

describe("CatalogEntityRegistry", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let catalogEntityRegistry: CatalogEntityRegistry;
  let catalogCategoryRegistry: CatalogCategoryRegistry;

  beforeAll(() => {
    di = getDiForUnitTesting();

    catalogCategoryRegistry = di.inject(catalogCategoryRegistryInjectable);
    catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
  });

  describe("updateItems", () => {
    it("adds new catalog item", () => {
      const items = [{
        apiVersion: "entity.k8slens.dev/v1alpha1",
        kind: "KubernetesCluster",
        metadata: {
          uid: "123",
          name: "foobar",
          source: "test",
          labels: {},
        },
        status: {
          phase: "disconnected",
        },
        spec: {},
      }];

      catalogEntityRegistry.updateItems(items);
      expect(catalogEntityRegistry.items.length).toEqual(1);

      items.push({
        apiVersion: "entity.k8slens.dev/v1alpha1",
        kind: "KubernetesCluster",
        metadata: {
          uid: "456",
          name: "barbaz",
          source: "test",
          labels: {},
        },
        status: {
          phase: "disconnected",
        },
        spec: {},
      });

      catalogEntityRegistry.updateItems(items);
      expect(catalogEntityRegistry.items.length).toEqual(2);
    });

    it("updates existing items", () => {
      const items = [{
        apiVersion: "entity.k8slens.dev/v1alpha1",
        kind: "KubernetesCluster",
        metadata: {
          uid: "123",
          name: "foobar",
          source: "test",
          labels: {},
        },
        status: {
          phase: "disconnected",
        },
        spec: {},
      }];

      catalogEntityRegistry.updateItems(items);
      expect(catalogEntityRegistry.items.length).toEqual(1);
      expect(catalogEntityRegistry.items[0].status.phase).toEqual("disconnected");

      items[0].status.phase = "connected";

      catalogEntityRegistry.updateItems(items);
      expect(catalogEntityRegistry.items.length).toEqual(1);
      expect(catalogEntityRegistry.items[0].status.phase).toEqual("connected");
    });

    it("updates activeEntity", () => {
      const items = [{
        apiVersion: "entity.k8slens.dev/v1alpha1",
        kind: "KubernetesCluster",
        metadata: {
          uid: "123",
          name: "foobar",
          source: "test",
          labels: {},
        },
        status: {
          phase: "disconnected",
        },
        spec: {},
      }];

      catalogEntityRegistry.updateItems(items);
      catalogEntityRegistry.activeEntity = catalogEntityRegistry.items[0];
      expect(catalogEntityRegistry.activeEntity.status.phase).toEqual("disconnected");

      items[0].status.phase = "connected";
      catalogEntityRegistry.updateItems(items);
      expect(catalogEntityRegistry.activeEntity.status.phase).toEqual("connected");
    });

    it("removes deleted items", () => {
      const items = [
        {
          apiVersion: "entity.k8slens.dev/v1alpha1",
          kind: "KubernetesCluster",
          metadata: {
            uid: "123",
            name: "foobar",
            source: "test",
            labels: {},
          },
          status: {
            phase: "disconnected",
          },
          spec: {},
        },
        {
          apiVersion: "entity.k8slens.dev/v1alpha1",
          kind: "KubernetesCluster",
          metadata: {
            uid: "456",
            name: "barbaz",
            source: "test",
            labels: {},
          },
          status: {
            phase: "disconnected",
          },
          spec: {},
        },
      ];

      catalogEntityRegistry.updateItems(items);
      items.splice(0, 1);
      catalogEntityRegistry.updateItems(items);
      expect(catalogEntityRegistry.items.length).toEqual(1);
      expect(catalogEntityRegistry.items[0].metadata.uid).toEqual("456");
    });
  });

  describe("items", () => {
    it("does not return items without matching category", () => {
      const items = [
        {
          apiVersion: "entity.k8slens.dev/v1alpha1",
          kind: "KubernetesCluster",
          metadata: {
            uid: "123",
            name: "foobar",
            source: "test",
            labels: {},
          },
          status: {
            phase: "disconnected",
          },
          spec: {},
        },
        {
          apiVersion: "entity.k8slens.dev/v1alpha1",
          kind: "FooBar",
          metadata: {
            uid: "456",
            name: "barbaz",
            source: "test",
            labels: {},
          },
          status: {
            phase: "disconnected",
          },
          spec: {},
        },
      ];

      catalogEntityRegistry.updateItems(items);
      expect(catalogEntityRegistry.items.length).toBe(2);
    });
  });

  it("does return items after matching category is added", () => {
    const items = [
      {
        apiVersion: "entity.k8slens.dev/v1alpha1",
        kind: "FooBar",
        metadata: {
          uid: "456",
          name: "barbaz",
          source: "test",
          labels: {},
        },
        status: {
          phase: "disconnected",
        },
        spec: {},
      },
    ];

    catalogEntityRegistry.updateItems(items);
    catalogCategoryRegistry.add(new FooBarCategory());
    expect(catalogEntityRegistry.items.length).toBe(1);
  });

  it("does not return items that are filtered out", () => {
    const source = observable.array([entity, entity2, entitykc]);

    catalogEntityRegistry.updateItems(source);

    expect(catalogEntityRegistry.items.length).toBe(3);
    expect(catalogEntityRegistry.filteredItems.length).toBe(3);

    const d = catalogEntityRegistry.addCatalogFilter(entity => entity.kind === KubernetesCluster.kind);

    expect(catalogEntityRegistry.items.length).toBe(3);
    expect(catalogEntityRegistry.filteredItems.length).toBe(1);

    // Remove filter
    d();

    expect(catalogEntityRegistry.items.length).toBe(3);
    expect(catalogEntityRegistry.filteredItems.length).toBe(3);
  });
});
