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

import { once } from "lodash";
import { IComputedValue, observable, ObservableSet, when } from "mobx";
import { CatalogCategorySpecVersion, CatalogCategoryRegistration as CommonCatalogCategoryRegistration, CategoryMetadata, CatalogEntityStatus, parseApiVersion } from "../../common/catalog";
import { CatalogCategoryRegistry as CommonCatalogCategoryRegistry } from "../../common/catalog";
import { disposer, Disposer } from "../../common/utils";
import type { CatalogEntity } from "./catalog-entity";

type SpecFromEntity<Entity> = Entity extends CatalogEntity<any, infer Spec> ? Spec : never;

export type StatusComputation = (entity: CatalogEntity) => IComputedValue<CatalogEntityStatus>;
export type SpecEnhancer = (entity: CatalogEntity) => IComputedValue<Partial<SpecFromEntity<CatalogEntity>>>;

export interface CategorySpecVersion extends CatalogCategorySpecVersion {
  /**
   * This function is called once per ID, even if there was a period of time when that item was no longer in the catalog
   */
  getStatus: StatusComputation;
}

export type CatalogCategoryRegistration = CommonCatalogCategoryRegistration<CategoryMetadata, CategorySpecVersion>;

export interface CatalogCategory extends CatalogCategoryRegistration {
  specEnhancers: ObservableSet<SpecEnhancer>;
}

export interface EntityEnhancerFunctions {
  status: StatusComputation,
  spec: SpecEnhancer[];
}

export class CatalogCategoryRegistry extends CommonCatalogCategoryRegistry<CatalogCategoryRegistration, CatalogCategory> {
  protected register(registration: CatalogCategoryRegistration): CatalogCategory {
    return {
      specEnhancers: observable.set(),
      ...registration
    };
  }

  /**
   * Adds a way compute optional part of a CatalogEntity's spec field.
   * The value passed into the `handler` is the non-computed value.
   * The returned value should respect the initial spec.
   * @param apiVersion The apiVersion of the entity
   * @param kind The kind of the entity
   * @param handler A function that is called with the raw entity data, once on initial creation.
   * @returns A function to remove this enhancer
   */
  registerSpecEnhancer(apiVersion: string, kind: string, handler: SpecEnhancer): Disposer {
    const { group, version } = parseApiVersion(apiVersion, false);

    if (version) {
      // only one version to do
      return disposer(
        when(
          () => this.hasForGroupKind(group, version, kind),
          () => {
            this.groupVersionKinds
              .get(group)
              .get(version)
              .get(kind)
              .specEnhancers.add(handler);
          },
        ),
        once(() => this.groupVersionKinds.get(group)?.get(version)?.delete(kind)),
      );
    }

    throw new Error("Not providing a version for groups is not supported at this time");
    // This would requiring observing future additions to the second level of the map
    // and waiting for them to add the kind
    // all wrapped up in disposers
  }

  getEnhancerForEntity(entity: CatalogEntity): EntityEnhancerFunctions | null {
    const { group, version } = parseApiVersion(entity.apiVersion);
    const catalog = this.groupVersionKinds.get(group)?.get(version)?.get(entity.kind);

    if (!catalog) {
      return null;
    }

    return {
      status: catalog.spec.versions.find(spec => spec.version === version).getStatus,
      spec: Array.from(catalog.specEnhancers)
    };
  }
}
