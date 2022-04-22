/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { CatalogCategory } from "../catalog-entity";
import { KubernetesCluster, WebLink } from "../../../common/catalog-entities";
import { observable } from "mobx";
import type { CatalogCategoryRegistry } from "../../../common/catalog";
import { categoryVersion } from "../../../common/catalog";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { CatalogEntityRegistry } from "../catalog/entity/registry";
import catalogEntityRegistryInjectable from "../catalog/entity/registry.injectable";
import catalogCategoryRegistryInjectable from "../../../common/catalog/category-registry.injectable";


class FooBarCategory extends CatalogCategory {
  public readonly apiVersion = "entityRegistry.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "FooBars",
    icon: "broken",
  };
  public spec = {
    group: "entity.k8slens.dev",
    versions: [
      categoryVersion("v1alpha1", WebLink),
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
  let entityRegistry: CatalogEntityRegistry;
  let catalogCategoryRegistry: CatalogCategoryRegistry;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    entityRegistry = di.inject(catalogEntityRegistryInjectable);
    catalogCategoryRegistry = di.inject(catalogCategoryRegistryInjectable);
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

      entityRegistry.updateItems(items);
      expect(entityRegistry.items.get().length).toEqual(1);

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

      entityRegistry.updateItems(items);
      expect(entityRegistry.items.get().length).toEqual(2);
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

      entityRegistry.updateItems(items);
      expect(entityRegistry.items.get().length).toEqual(1);
      expect(entityRegistry.items.get()[0].status.phase).toEqual("disconnected");

      items[0].status.phase = "connected";

      entityRegistry.updateItems(items);
      expect(entityRegistry.items.get().length).toEqual(1);
      expect(entityRegistry.items.get()[0].status.phase).toEqual("connected");
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

      entityRegistry.updateItems(items);
      entityRegistry.activeEntity = entityRegistry.items.get()[0];
      expect(entityRegistry.activeEntity.status.phase).toEqual("disconnected");

      items[0].status.phase = "connected";
      entityRegistry.updateItems(items);
      expect(entityRegistry.activeEntity.status.phase).toEqual("connected");
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

      entityRegistry.updateItems(items);
      items.splice(0, 1);
      entityRegistry.updateItems(items);
      expect(entityRegistry.items.get().length).toEqual(1);
      expect(entityRegistry.items.get()[0].metadata.uid).toEqual("456");
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

      entityRegistry.updateItems(items);
      expect(entityRegistry.items.get().length).toBe(1);
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

    entityRegistry.updateItems(items);
    catalogCategoryRegistry.add(new FooBarCategory());
    expect(entityRegistry.items.get().length).toBe(1);
  });

  it("does not return items that are filtered out", () => {
    const source = observable.array([entity, entity2, entitykc]);

    entityRegistry.updateItems(source);

    expect(entityRegistry.items.get().length).toBe(3);
    expect(entityRegistry.filteredItems.length).toBe(3);

    const d = entityRegistry.addCatalogFilter(entity => entity.kind === KubernetesCluster.kind);

    expect(entityRegistry.items.get().length).toBe(3);
    expect(entityRegistry.filteredItems.length).toBe(1);

    // Remove filter
    d();

    expect(entityRegistry.items.get().length).toBe(3);
    expect(entityRegistry.filteredItems.length).toBe(3);
  });
});
