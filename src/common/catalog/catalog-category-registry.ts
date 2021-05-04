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
import { action, computed, observable, when } from "mobx";

import { navigate } from "../../renderer/navigation";
import { Rest } from "../ipc";
import { Disposer, disposer, ExtendedMap, Singleton, StrictMap } from "../utils";
import {
  AddMenuOpenHandler,
  CatalogCategorySpec,
  CatalogCategoryVersion,
  CatalogEntity,
  CatalogEntityConstructor,
  CatalogEntityData,
  CatalogEntityKindData,
  CategoryHandler,
  ContextMenuOpenHandler,
  MatchingCatalogEntityData,
  parseApiVersion,
  SettingsMenuOpenHandler,
} from "./catalog-entity";


type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
type KeysNotMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? never : K  }[keyof T];

export type CategoryHandlers = {
  [HandlerName in KeysMatching<CatalogCategory, Set<any>>]?: CatalogCategory[HandlerName] extends Set<infer Handler> ? Handler : never;
};
export type CategoryHandlerNames = keyof CategoryHandlers;
export type CatalogHandler<Name extends CategoryHandlerNames> = CategoryHandlers[Name];

export type EntityContextHandlers = keyof EntityContextGetters;
export type GlobalContextHandlers = keyof GlobalContextGetters;

type EntityContextGetters = {
  [HandlerName in KeysMatching<CategoryHandlers, CategoryHandler<(...args: any) => any>>]: () => Rest<Parameters<CategoryHandlers[HandlerName]>>;
};

type GlobalContextGetters = {
  [HandlerName in KeysNotMatching<CategoryHandlers, CategoryHandler<(...args: any) => any>>]: () => Parameters<CategoryHandlers[HandlerName]>;
};

const EntityContexts: EntityContextGetters = {
  onContextMenuOpen: () => [{ navigate }],
  onSettingsOpen: () => [{ navigate }],
};
const GlobalContexts: GlobalContextGetters = {
  onAddMenuOpen: () => [{ navigate }],
};

/**
 * Note: this type shouldn't be exported or leaked out of this file.
 * The registry should do everything for any consumer of this type.
 */
class CatalogCategory implements CatalogCategorySpec {
  onContextMenuOpen = new Set<CategoryHandler<ContextMenuOpenHandler>>();
  onSettingsOpen = new Set<CategoryHandler<SettingsMenuOpenHandler>>();
  onAddMenuOpen = new Set<AddMenuOpenHandler>();

  public readonly id: string;

  public readonly apiVersion: string;
  public readonly kind: string;
  public readonly metadata: {
    name: string;
    icon: string;
  };

  public readonly spec: {
    group: string;
    versions: CatalogCategoryVersion<CatalogEntity>[];
    names: {
      kind: string;
    };
  };

  constructor(specAndHandlers: CatalogCategorySpec & CategoryHandlers) {
    const { apiVersion, kind, metadata, spec, ...handlers } = specAndHandlers;

    this.spec = spec;
    this.apiVersion = apiVersion;
    this.kind = kind;
    this.metadata = metadata;
    this.id = `${spec.group}/${spec.names.kind}`;

    for (const name of Object.keys(handlers)) {
      const handlerName = name as CategoryHandlerNames;

      if (typeof handlers[handlerName] === "function") {
        this[handlerName].add(handlers[handlerName] as any);
      }
    }
  }
}

export class CatalogCategoryRegistry extends Singleton {
  /**
   * The three levels of keys are: (for category ApiVersions)
   * 1. `GROUP`
   * 2. `VERSION`
   */
  protected categories = observable.set<CatalogCategory>();

  /**
   * The three levels of keys are: (by entity ApiVersions)
   * 1. `GROUP`
   * 2. `VERSION`
   * 3. `KIND`
   */
  @computed protected get entityToCategoryTable(): Map<string, Map<string, Map<string, [CatalogCategory, CatalogEntityConstructor<CatalogEntity>]>>> {
    const res = ExtendedMap.newExtendedStrict<string, string, string, [CatalogCategory, CatalogEntityConstructor<CatalogEntity>]>();

    for (const category of this.categories.values()) {
      const grouping = res.getOrDefault(category.spec.group);

      for (const { version, entityClass } of category.spec.versions) {
        grouping
          .getOrDefault(version)
          .strictSet(category.spec.names.kind, [category, entityClass]);
      }
    }

    return res;
  }

  @computed protected get categoryIdLookup(): Map<string, CatalogCategory> {
    const res = new StrictMap<string, CatalogCategory>();

    for (const category of this.categories.values()) {
      res.strictSet(category.id, category);
    }

    return res;
  }

  /**
   * Registers (and potentially overrides a previous category)
   * @param specAndHandlers The Category spec and initial handlers to register
   * @returns the ability to remove this category
   */
  @action add(specAndHandlers: CatalogCategorySpec & CategoryHandlers): Disposer {
    parseApiVersion(specAndHandlers.apiVersion); // make sure this is valid
    const category = new CatalogCategory(specAndHandlers);

    this.categories.add(category);

    return () => void this.categories.delete(category);
  }

  @computed get items(): CatalogCategorySpec[] {
    return Array.from(this.categoryIdLookup.values());
  }

  getById(id: string): CatalogCategorySpec | undefined {
    return this.categoryIdLookup.get(id);
  }

  /**
   * Gets the `CatalogCategory` once it has been registered
   * @param apiVersion the ApiVersion string of the category
   * @param kind the kind of entity that is desired
   */
  registerHandler(apiVersion: string, kind: string, handlerName: CategoryHandlerNames, handler: CatalogHandler<typeof handlerName>): Disposer {
    const { group, version } = parseApiVersion(apiVersion, false);

    if (version) {
      // only one version to do
      return disposer(
        when(
          () => this.entityToCategoryTable.get(group)?.get(version)?.has(kind),
          () => {
            const [category] = this.entityToCategoryTable.get(group).get(version).get(kind);

            category[handlerName].add(handler as any);
          },
        ),
        () => void this.entityToCategoryTable.get(group)?.get(version)?.delete(kind),
      );
    }

    throw new Error("Not providing a version for groups is not supported at this time");
    // This would requiring observing future additions to the second level of the map
    // and waiting for them to add the kind
    // all wrapped up in disposers
  }

  runEntityHandlersFor(entity: CatalogEntity, handlerName: "onContextMenuOpen"): ReturnType<CategoryHandlers[typeof handlerName]>;
  runEntityHandlersFor(entity: CatalogEntity, handlerName: "onSettingsOpen"): ReturnType<CategoryHandlers[typeof handlerName]>;
  runEntityHandlersFor(entity: CatalogEntity, handlerName: EntityContextHandlers): ReturnType<CategoryHandlers[typeof handlerName]> {
    const category = this.getCategoryForEntity(entity) as CatalogCategory; // safe and what it actually is
    const res = (entity[handlerName] as any)?.(...EntityContexts[handlerName]()) ?? [];

    console.log(category, res);

    for (const handler of category[handlerName].values()) {
      res.push((handler as any)(entity, ...EntityContexts[handlerName]()));
    }

    return res.flat();
  }

  runGlobalHandlersFor({ spec }: CatalogCategorySpec, handlerName: "onAddMenuOpen"): ReturnType<CategoryHandlers[typeof handlerName]>;
  runGlobalHandlersFor({ spec }: CatalogCategorySpec, handlerName: GlobalContextHandlers): ReturnType<CategoryHandlers[typeof handlerName]> {
    const category = this.categoryIdLookup.get(`${spec.group}/${spec.names.kind}`);
    const res = [];

    for (const handler of category[handlerName].values()) {
      res.push((handler as any)(...GlobalContexts[handlerName]()));
    }

    return res.flat();
  }

  getEntityForData<Entity extends CatalogEntity>(data: MatchingCatalogEntityData<Entity> & CatalogEntityKindData): Entity {
    const { group, version } = parseApiVersion(data.apiVersion);

    const [, entityClass] = this.entityToCategoryTable.get(group)?.get(version)?.get(data.kind);
    const res = new entityClass(data);

    if (res.apiVersion !== data.apiVersion || res.kind !== data.kind) {
      throw new TypeError(`CatalogEntity class declared for ${group}/${version}:${data.kind} produced ${res.apiVersion}:${res.kind}`);
    }

    return res as Entity;
  }

  getCategoryForEntity(data: CatalogEntityData & CatalogEntityKindData): CatalogCategorySpec | undefined {
    const { group, version } = parseApiVersion(data.apiVersion);

    return this.entityToCategoryTable.get(group)?.get(version)?.get(data.kind)?.[0];
  }
}
