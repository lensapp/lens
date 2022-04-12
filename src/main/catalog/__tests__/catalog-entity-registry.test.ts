/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable, reaction } from "mobx";
import type { WebLinkSpec, WebLinkStatus } from "../../../common/catalog-entities";
import { WebLink } from "../../../common/catalog-entities";
import type { CatalogEntityMetadata } from "../../../common/catalog";
import { CatalogEntity } from "../../../common/catalog";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import catalogEntityRegistryInjectable from "../entity-registry.injectable";
import type { CatalogEntityRegistry } from "../entity-registry";

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
  let entityRegistry: CatalogEntityRegistry;
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
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    entityRegistry = di.inject(catalogEntityRegistryInjectable);
  });

  describe("addSource", () => {
    it ("allows to add an observable source", () => {
      const source = observable.array<WebLink>([]);

      entityRegistry.addObservableSource("test", source);
      expect(entityRegistry.items.length).toEqual(0);

      source.push(entity);

      expect(entityRegistry.items.length).toEqual(1);
    });

    it ("added source change triggers reaction", (done) => {
      const source = observable.array<WebLink>([]);

      entityRegistry.addObservableSource("test", source);
      reaction(() => entityRegistry.items, () => {
        done();
      });

      source.push(entity);
    });
  });

  describe("removeSource", () => {
    it ("removes source", () => {
      const source = observable.array<WebLink>([]);

      entityRegistry.addObservableSource("test", source);
      source.push(entity);
      entityRegistry.removeSource("test");

      expect(entityRegistry.items.length).toEqual(0);
    });
  });

  describe("items", () => {
    it("returns added items", () => {
      expect(entityRegistry.items.length).toBe(0);

      const source = observable.array([entity]);

      entityRegistry.addObservableSource("test", source);
      expect(entityRegistry.items.length).toBe(1);
    });

    it("does not return items without matching category", () => {
      const source = observable.array([invalidEntity]);

      entityRegistry.addObservableSource("test", source);
      expect(entityRegistry.items.length).toBe(0);
    });
  });
});
