/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable, reaction } from "mobx";
import type { WebLinkSpec, WebLinkStatus } from "../../../common/catalog-entities";
import { WebLink } from "../../../common/catalog-entities";
import type { CatalogEntityMetadata } from "../../../common/catalog";
import { catalogCategoryRegistry, CatalogEntity } from "../../../common/catalog";
import { CatalogEntityRegistry } from "../catalog-entity-registry";

class InvalidEntity extends CatalogEntity<CatalogEntityMetadata, WebLinkStatus, WebLinkSpec> {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "Invalid";

  async onRun() {
    return;
  }

  public onSettingsOpen(): void {
    return;
  }

  public onDetailsOpen(): void {
    return;
  }

  public onContextMenuOpen(): void {
    return;
  }
}

describe("CatalogEntityRegistry", () => {
  let registry: CatalogEntityRegistry;
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

  beforeEach(() => {
    registry = new CatalogEntityRegistry(catalogCategoryRegistry);
  });

  describe("addSource", () => {
    it ("allows to add an observable source", () => {
      const source = observable.array<WebLink>([]);

      registry.addObservableSource("test", source);
      expect(registry.items.length).toEqual(0);

      source.push(entity);

      expect(registry.items.length).toEqual(1);
    });

    it ("added source change triggers reaction", (done) => {
      const source = observable.array<WebLink>([]);

      registry.addObservableSource("test", source);
      reaction(() => registry.items, () => {
        done();
      });

      source.push(entity);
    });
  });

  describe("removeSource", () => {
    it ("removes source", () => {
      const source = observable.array<WebLink>([]);

      registry.addObservableSource("test", source);
      source.push(entity);
      registry.removeSource("test");

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
