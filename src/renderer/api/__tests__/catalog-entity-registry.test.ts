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
import "../../../common/catalog-entities";
import { catalogCategoryRegistry } from "../../../common/catalog/catalog-category-registry";
import type { CatalogEntityData, CatalogEntityKindData } from "../catalog-entity";

class TestCatalogEntityRegistry extends CatalogEntityRegistry {
  replaceItems(items: Array<CatalogEntityData & CatalogEntityKindData>) {
    this.rawItems.replace(items);
  }
}

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
          labels: {}
        },
        status: {
          phase: "disconnected"
        },
        spec: {}
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
          labels: {}
        },
        status: {
          phase: "disconnected"
        },
        spec: {}
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
          labels: {}
        },
        status: {
          phase: "disconnected"
        },
        spec: {}
      }];

      catalog.replaceItems(items);
      expect(catalog.items.length).toEqual(1);
      expect(catalog.items[0].status.phase).toEqual("disconnected");

      items[0].status.phase = "connected";

      catalog.replaceItems(items);
      expect(catalog.items.length).toEqual(1);
      expect(catalog.items[0].status.phase).toEqual("connected");
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
            labels: {}
          },
          status: {
            phase: "disconnected"
          },
          spec: {}
        },
        {
          apiVersion: "entity.k8slens.dev/v1alpha1",
          kind: "KubernetesCluster",
          metadata: {
            uid: "456",
            name: "barbaz",
            source: "test",
            labels: {}
          },
          status: {
            phase: "disconnected"
          },
          spec: {}
        }
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
            labels: {}
          },
          status: {
            phase: "disconnected"
          },
          spec: {}
        },
        {
          apiVersion: "entity.k8slens.dev/v1alpha1",
          kind: "FooBar",
          metadata: {
            uid: "456",
            name: "barbaz",
            source: "test",
            labels: {}
          },
          status: {
            phase: "disconnected"
          },
          spec: {}
        }
      ];

      catalog.replaceItems(items);

      expect(catalog.items.length).toBe(1);
    });
  });
});
