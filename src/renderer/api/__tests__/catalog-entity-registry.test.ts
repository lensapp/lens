import { CatalogEntityRegistry } from "../catalog-entity-registry";
import "../../../common/catalog-entities";
import { catalogCategoryRegistry } from "../../../common/catalog-category-registry";

describe("CatalogEntityRegistry", () => {
  describe("updateItems", () => {
    it("adds new catalog item", () => {
      const catalog = new CatalogEntityRegistry(catalogCategoryRegistry);
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

      catalog.updateItems(items);
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

      catalog.updateItems(items);
      expect(catalog.items.length).toEqual(2);
    });

    it("ignores unknown items", () => {
      const catalog = new CatalogEntityRegistry(catalogCategoryRegistry);
      const items = [{
        apiVersion: "entity.k8slens.dev/v1alpha1",
        kind: "FooBar",
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

      catalog.updateItems(items);
      expect(catalog.items.length).toEqual(0);
    });

    it("updates existing items", () => {
      const catalog = new CatalogEntityRegistry(catalogCategoryRegistry);
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

      catalog.updateItems(items);
      expect(catalog.items.length).toEqual(1);
      expect(catalog.items[0].status.phase).toEqual("disconnected");

      items[0].status.phase = "connected";

      catalog.updateItems(items);
      expect(catalog.items.length).toEqual(1);
      expect(catalog.items[0].status.phase).toEqual("connected");
    });

    it("removes deleted items", () => {
      const catalog = new CatalogEntityRegistry(catalogCategoryRegistry);
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

      catalog.updateItems(items);
      items.splice(0, 1);
      catalog.updateItems(items);
      expect(catalog.items.length).toEqual(1);
      expect(catalog.items[0].metadata.uid).toEqual("456");
    });
  });
});
