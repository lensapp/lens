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

import { CatalogEntityRegistry } from "../catalog-entity-registry";
import { catalogCategoryRegistry } from "../../../common/catalog/catalog-category-registry";
import { CatalogCategory, CatalogEntityData, CatalogEntityKindData } from "../catalog-entity";
import { KubernetesCluster, WebLink } from "../../../common/catalog-entities";
import { observable } from "mobx";

class TestCatalogEntityRegistry extends CatalogEntityRegistry {
  replaceItems(items: Array<CatalogEntityData & CatalogEntityKindData>) {
    this.updateItems(items);
  }
}

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
  describe("updateItems", () => {
    it("adds new catalog item", () => {
      const catalog = new TestCatalogEntityRegistry(catalogCategoryRegistry);
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

      catalog.replaceItems(items);
      expect(catalog.items.length).toEqual(1);

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

      catalog.replaceItems(items);
      expect(catalog.items.length).toEqual(2);
    });

    it("updates existing items", () => {
      const catalog = new TestCatalogEntityRegistry(catalogCategoryRegistry);
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

      catalog.replaceItems(items);
      expect(catalog.items.length).toEqual(1);
      expect(catalog.items[0].status.phase).toEqual("disconnected");

      items[0].status.phase = "connected";

      catalog.replaceItems(items);
      expect(catalog.items.length).toEqual(1);
      expect(catalog.items[0].status.phase).toEqual("connected");
    });

    it("updates activeEntity", () => {
      const catalog = new TestCatalogEntityRegistry(catalogCategoryRegistry);
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

      catalog.replaceItems(items);
      catalog.activeEntity = catalog.items[0];
      expect(catalog.activeEntity.status.phase).toEqual("disconnected");

      items[0].status.phase = "connected";
      catalog.replaceItems(items);
      expect(catalog.activeEntity.status.phase).toEqual("connected");
    });

    it("removes deleted items", () => {
      const catalog = new TestCatalogEntityRegistry(catalogCategoryRegistry);
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

      catalog.replaceItems(items);
      items.splice(0, 1);
      catalog.replaceItems(items);
      expect(catalog.items.length).toEqual(1);
      expect(catalog.items[0].metadata.uid).toEqual("456");
    });
  });

  describe("items", () => {
    it("does not return items without matching category", () => {
      const catalog = new TestCatalogEntityRegistry(catalogCategoryRegistry);
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

      catalog.replaceItems(items);
      expect(catalog.items.length).toBe(1);
    });
  });

  it("does return items after matching category is added", () => {
    const catalog = new TestCatalogEntityRegistry(catalogCategoryRegistry);
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

    catalog.replaceItems(items);
    catalogCategoryRegistry.add(new FooBarCategory());
    expect(catalog.items.length).toBe(1);
  });

  it("does not return items that are filtered out", () => {
    const source = observable.array([entity, entity2, entitykc]);
    const catalog = new TestCatalogEntityRegistry(catalogCategoryRegistry);

    catalog.replaceItems(source);

    expect(catalog.items.length).toBe(3);
    expect(catalog.filteredItems.length).toBe(3);

    const d = catalog.addCatalogFilter(entity => entity.kind === KubernetesCluster.kind);

    expect(catalog.items.length).toBe(3);
    expect(catalog.filteredItems.length).toBe(1);

    // Remove filter
    d();

    expect(catalog.items.length).toBe(3);
    expect(catalog.filteredItems.length).toBe(3);
  });
});
