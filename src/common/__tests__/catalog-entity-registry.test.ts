import { observable, reaction } from "mobx";
import { WebLink } from "../catalog-entities";
import { CatalogEntityRegistry } from "../catalog";

describe("CatalogEntityRegistry", () => {
  let registry: CatalogEntityRegistry;
  const entity = new WebLink({
    metadata: {
      uid: "test",
      name: "test-link",
      source: "test",
      labels: {}
    },
    spec: {
      url: "https://k8slens.dev"
    },
    status: {
      phase: "valid"
    }
  });

  beforeEach(() => {
    registry = new CatalogEntityRegistry();
  });

  describe("addSource", () => {
    it ("allows to add an observable source", () => {
      const source = observable.array([]);

      registry.addObservableSource("test", source);
      expect(registry.items.length).toEqual(0);

      source.push(entity);

      expect(registry.items.length).toEqual(1);
    });

    it ("added source change triggers reaction", (done) => {
      const source = observable.array([]);

      registry.addObservableSource("test", source);
      reaction(() => registry.items, () => {
        done();
      });

      source.push(entity);
    });
  });

  describe("removeSource", () => {
    it ("removes source", () => {
      const source = observable.array([]);

      registry.addObservableSource("test", source);
      source.push(entity);
      registry.removeSource("test");

      expect(registry.items.length).toEqual(0);
    });
  });
});
