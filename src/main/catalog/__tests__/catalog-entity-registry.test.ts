/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable, reaction } from "mobx";
import { WebLink, WebLinkSpec, WebLinkStatus } from "../../../common/catalog-entities";
import { CatalogEntity, CatalogEntityMetadata } from "../../../common/catalog";
import type { CatalogEntityRegistry } from "../catalog-entity-registry";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import catalogEntityRegistryInjectable from "../entity-registry.injectable";

class InvalidEntity extends CatalogEntity<CatalogEntityMetadata, WebLinkStatus, WebLinkSpec> {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "Invalid";
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
const invalidEntity = new InvalidEntity({
  metadata: {
    uid: "invalid",
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

describe("CatalogEntityRegistry", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let registry: CatalogEntityRegistry;

  beforeEach(() => {
    di = getDiForUnitTesting();

    registry = di.inject(catalogEntityRegistryInjectable);
  });

  describe("addSource", () => {
    it ("allows to add an observable source", () => {
      const source = observable.array([]);

      registry.addObservableSource(source);
      expect(registry.items.length).toEqual(0);

      source.push(entity);

      expect(registry.items.length).toEqual(1);
    });

    it ("added source change triggers reaction", (done) => {
      const source = observable.array([]);

      registry.addObservableSource(source);
      reaction(() => registry.items, () => {
        done();
      });

      source.push(entity);
    });
  });

  describe("removeSource", () => {
    it ("removes source", () => {
      const source = observable.array([]);
      const remove = registry.addObservableSource(source);

      source.push(entity);
      remove();

      expect(registry.items.length).toEqual(0);
    });
  });

  describe("items", () => {
    it("returns added items", () => {
      expect(registry.items.length).toBe(0);

      const source = observable.array([entity]);

      registry.addObservableSource(source);
      expect(registry.items.length).toBe(1);
    });

    it("throws if you try to add an entity that doesn't have a matching category", () => {
      const source = observable.array([invalidEntity]);

      registry.addObservableSource(source);
      expect(() => registry.items).toThrowError("Unable to find a category for group=entity.k8slens.dev kind=Invalid");
    });
  });
});
