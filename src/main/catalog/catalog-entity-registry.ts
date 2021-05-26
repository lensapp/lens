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

import { computed, observable, IComputedValue, IObservableArray } from "mobx";
import type { CatalogEntity, CatalogEntityComputed } from "./catalog-entity";
import { Disposer, ExtendedObservableMap, iter, Singleton } from "../../common/utils";
import { CatalogCategoryRegistry } from "./catalog-category-registry";
import type { CatalogEntitySpec, CatalogEntityStatus } from "../../common/catalog";
import { cloneDeep } from "lodash";

type SpecFromEntity<Entity> = Entity extends CatalogEntity<any, infer Spec> ? Spec : never;

interface EntityEnhancers {
  status: IComputedValue<CatalogEntityStatus>,
  spec: IComputedValue<Partial<SpecFromEntity<CatalogEntity>>>[];
}

export class CatalogEntityRegistry extends Singleton {
  protected sources = observable.map<string, IComputedValue<CatalogEntity[]>>([], { deep: true });
  protected computedEnhancers = new ExtendedObservableMap<string, EntityEnhancers>();

  addObservableSource(id: string, source: IObservableArray<CatalogEntity>): Disposer {
    return this.addComputedSource(id, computed(() => source));
  }

  addComputedSource(id: string, source: IComputedValue<CatalogEntity[]>): Disposer {
    this.sources.set(id, source);

    return () => this.sources.delete(id);
  }

  @computed private get rawItems() {
    const allItems = Array.from(iter.flatMap(this.sources.values(), source => source.get()));
    const res: CatalogEntity[] = [];

    for (const entity of allItems) {
      const enhancers = CatalogCategoryRegistry.getInstance().getEnhancerForEntity(entity);

      if (!enhancers) {
        continue;
      }

      this.computedEnhancers.getOrInsert(entity.metadata.uid, () => ({
        status: enhancers.status(entity),
        spec: enhancers.spec.map(enhancer => enhancer(entity)),
      }));
    }

    return res;
  }

  @computed get items(): CatalogEntityComputed[] {
    const res: CatalogEntityComputed[] = [];

    for (const { spec, ...entity } of this.rawItems) {
      const enhancers = this.computedEnhancers.get(entity.metadata.uid);

      res.push({
        status: enhancers.status.get(),
        spec: this.foldSpecs(spec, enhancers.spec),
        ...entity
      });
    }

    return res;
  }

  private foldSpecs(spec: CatalogEntitySpec, enhancers: IComputedValue<Partial<CatalogEntitySpec>>[]): CatalogEntitySpec {
    const res = cloneDeep(spec);

    for (const enhancer of enhancers) {
      Object.assign(res, enhancer.get());
    }

    return res;
  }
}
