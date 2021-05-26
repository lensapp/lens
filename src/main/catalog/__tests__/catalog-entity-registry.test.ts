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

import { observable, reaction } from "mobx";
import type { CatalogEntityData } from "../../../renderer/catalog";
import { initCatalogCategories } from "../../initializers";
import { CatalogCategoryRegistry } from "../catalog-category-registry";
import type { CatalogEntity } from "../catalog-entity";
import { CatalogEntityRegistry } from "../catalog-entity-registry";

function getInvalidEntity(data: CatalogEntityData): CatalogEntity {
  return {
    apiVersion: "entity.k8slens.dev/v1alpha1",
    kind: "Invalid",
    ...data
  };
}

function getWeblinkEntity(data: CatalogEntityData): CatalogEntity {
  return {
    apiVersion: "entity.k8slens.dev/v1alpha1",
    kind: "WebLink",
    ...data
  };
}

describe("CatalogEntityRegistry", () => {
  let registry: CatalogEntityRegistry;
  const entity = getWeblinkEntity({
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
  const invalidEntity = getInvalidEntity({
    metadata: {
      uid: "invalid",
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
    CatalogCategoryRegistry.createInstance();
    initCatalogCategories();
    CatalogEntityRegistry.createInstance();
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

      const d1 = registry.addObservableSource("test", source);

      source.push(entity);
      d1();

      expect(registry.items.length).toEqual(0);
    });
  });

  describe("items", () => {
    it("returns added items", () => {
      expect(registry.items.length).toBe(0);

      const source = observable.array([entity]);

      registry.addObservableSource("test", source);
      expect(registry.items.length).toBe(1);
    });

    it("does not return items without matching category", () => {
      const source = observable.array([invalidEntity]);

      registry.addObservableSource("test", source);
      expect(registry.items.length).toBe(0);
    });
  });
});
