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

import type { ObservableSet } from "mobx";
import type { CatalogCategoryRegistration as CommonCatalogCategoryRegistration, CatalogCategorySpecVersion as CommonCatalogCategorySpecVersion, CatalogEntityMetadata, CatalogEntitySpec, CatalogEntityStatus, CategoryMetadata as CommonCategoryMetadata } from "../../common/catalog";
import type { OnContextMenuOpen, OnAddMenuOpen, OnSettingsOpen, CategoryHandler, CatalogEntity } from "./catalog-entity";
import type { Rest } from "../../common/ipc";
import type { navigate } from "../navigation";

type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
type KeysNotMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? never : K }[keyof T];

export type CategoryHandlers = {
  [HandlerName in KeysMatching<Handlers, ObservableSet<any>>]?: Handlers[HandlerName] extends ObservableSet<infer Handler> ? Handler : never;
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

export const EntityContexts: EntityContextGetters = {
  onContextMenuOpen: () => [{ navigate }],
  onSettingsOpen: () => [{ navigate }],
};

export const GlobalContexts: GlobalContextGetters = {
  onCatalogAddMenu: () => [{ navigate }],
};

export interface CategoryMetadata extends CommonCategoryMetadata {
  icon: string;
}

type ExtractEntityMetadataType<Entity> = Entity extends CatalogEntity<infer Metadata> ? Metadata : never;
type ExtractEntityStatusType<Entity> = Entity extends CatalogEntity<any, infer Status> ? Status : never;
type ExtractEntitySpecType<Entity> = Entity extends CatalogEntity<any, any, infer Spec> ? Spec : never;

export interface CatalogEntityData<
  Metadata extends CatalogEntityMetadata = CatalogEntityMetadata,
  Status extends CatalogEntityStatus = CatalogEntityStatus,
  Spec extends CatalogEntitySpec = CatalogEntitySpec,
> {
  metadata: Metadata;
  status: Status;
  spec: Spec;
}

export type CatalogEntityConstructor<Entity extends CatalogEntity> = (
  (new (data: CatalogEntityData<
    ExtractEntityMetadataType<Entity>,
    ExtractEntityStatusType<Entity>,
    ExtractEntitySpecType<Entity>
  >) => Entity)
);

export interface CatalogCategorySpecVersion extends CommonCatalogCategorySpecVersion {
  entityConstructor: CatalogEntityConstructor<CatalogEntity>,
}

export type CatalogCategoryRegistration = CommonCatalogCategoryRegistration<CategoryMetadata, CatalogCategorySpecVersion>;

export interface Handlers {
  onContextMenuOpen: ObservableSet<CategoryHandler<OnContextMenuOpen>>;
  onSettingsOpen: ObservableSet<CategoryHandler<OnSettingsOpen>>;
  onCatalogAddMenu: ObservableSet<OnAddMenuOpen>;
}


export type Filtered<Handler> = Handler extends ((...args: any[]) => (infer T)[]) ? (...args: Parameters<Handler>) => Omit<T, "onlyVisibleForSource">[] : Handler;
