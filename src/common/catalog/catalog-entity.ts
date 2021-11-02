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

import EventEmitter from "events";
import type TypedEmitter from "typed-emitter";
import { observable, makeObservable } from "mobx";
import { once } from "lodash";
import { iter, Disposer } from "../utils";

type ExtractEntityMetadataType<Entity> = Entity extends CatalogEntity<infer Metadata> ? Metadata : never;
type ExtractEntityStatusType<Entity> = Entity extends CatalogEntity<any, infer Status> ? Status : never;
type ExtractEntitySpecType<Entity> = Entity extends CatalogEntity<any, any, infer Spec> ? Spec : never;

export type CatalogEntityConstructor<Entity extends CatalogEntity> = (
  (new (data: CatalogEntityData<
    ExtractEntityMetadataType<Entity>,
    ExtractEntityStatusType<Entity>,
    ExtractEntitySpecType<Entity>
  >) => Entity)
);

export interface CatalogCategoryVersion<Entity extends CatalogEntity> {
  name: string;
  entityClass: CatalogEntityConstructor<Entity>;
}

export interface CatalogCategorySpec {
  group: string;
  versions: CatalogCategoryVersion<CatalogEntity>[];
  names: {
    kind: string;
  };
}

/**
 * If the filter returns true, the menu item is displayed
 */
export type AddMenuFilter = (menu: CatalogEntityAddMenu) => any;

export interface CatalogCategoryEvents {
  load: () => void;
  catalogAddMenu: (context: CatalogEntityAddMenuContext) => void;
  contextMenuOpen: (entity: CatalogEntity, context: CatalogEntityContextMenuContext) => void;
}

export abstract class CatalogCategory extends (EventEmitter as new () => TypedEmitter<CatalogCategoryEvents>) {
  abstract readonly apiVersion: string;
  abstract readonly kind: string;
  abstract metadata: {
    name: string;
    icon: string;
  };
  abstract spec: CatalogCategorySpec;

  protected filters = observable.set<AddMenuFilter>([], {
    deep: false,
  });

  static parseId(id = ""): { group?: string, kind?: string } {
    const [group, kind] = id.split("/") ?? [];

    return { group, kind };
  }

  public getId(): string {
    return `${this.spec.group}/${this.spec.names.kind}`;
  }

  /**
   * Add a filter for menu items of catalogAddMenu
   * @param fn The function that should return a truthy value if that menu item should be displayed
   * @returns A function to remove that filter
   */
  public addMenuFilter(fn: AddMenuFilter): Disposer {
    this.filters.add(fn);

    return once(() => void this.filters.delete(fn));
  }

  /**
   * Filter menuItems according to the Category's set filters
   * @param menuItems menu items to filter
   * @returns filtered menu items
   */
  public filteredItems(menuItems: CatalogEntityAddMenu[]) {
    return Array.from(
      iter.reduce(
        this.filters,
        iter.filter,
        menuItems.values(),
      ),
    );
  }
}

export interface CatalogEntityMetadata {
  uid: string;
  name: string;
  description?: string;
  source?: string;
  labels: Record<string, string>;
  [key: string]: string | object;
}

export interface CatalogEntityStatus {
  phase: string;
  reason?: string;

  /**
   * @default true
   */
  enabled?: boolean;
  message?: string;
  active?: boolean;
}

export interface CatalogEntityActionContext {
  navigate: (url: string) => void;
  setCommandPaletteContext: (context?: CatalogEntity) => void;
}

export interface CatalogEntityContextMenu {
  /**
   * Menu title
   */
  title: string;
  /**
   * Menu icon
   */
  icon?: string;
  /**
   * OnClick handler
   */
  onClick: () => void | Promise<void>;
  /**
   * Confirm click with a message
   */
  confirm?: {
    message: string;
  }
}

export interface CatalogEntityAddMenu extends CatalogEntityContextMenu {
  icon: string;
  defaultAction?: boolean;
}

export interface CatalogEntitySettingsMenu {
  group?: string;
  title: string;
  components: {
    View: React.ComponentType<any>
  };
}

export interface CatalogEntityContextMenuContext {
  /**
   * Navigate to the specified pathname
   */
  navigate: (pathname: string) => void;
  menuItems: CatalogEntityContextMenu[];
}

export interface CatalogEntitySettingsContext {
  menuItems: CatalogEntityContextMenu[];
}

export interface CatalogEntityAddMenuContext {
  navigate: (url: string) => void;
  menuItems: CatalogEntityAddMenu[];
}

export type CatalogEntitySpec = Record<string, any>;


export interface CatalogEntityData<
  Metadata extends CatalogEntityMetadata = CatalogEntityMetadata,
  Status extends CatalogEntityStatus = CatalogEntityStatus,
  Spec extends CatalogEntitySpec = CatalogEntitySpec,
> {
  metadata: Metadata;
  status: Status;
  spec: Spec;
}

export interface CatalogEntityKindData {
  readonly apiVersion: string;
  readonly kind: string;
}

export abstract class CatalogEntity<
  Metadata extends CatalogEntityMetadata = CatalogEntityMetadata,
  Status extends CatalogEntityStatus = CatalogEntityStatus,
  Spec extends CatalogEntitySpec = CatalogEntitySpec,
> implements CatalogEntityKindData {
  public abstract readonly apiVersion: string;
  public abstract readonly kind: string;

  @observable metadata: Metadata;
  @observable status: Status;
  @observable spec: Spec;

  constructor(data: CatalogEntityData<Metadata, Status, Spec>) {
    makeObservable(this);
    this.metadata = data.metadata;
    this.status = data.status;
    this.spec = data.spec;
  }

  public getId(): string {
    return this.metadata.uid;
  }

  public getName(): string {
    return this.metadata.name;
  }

  public abstract onRun?(context: CatalogEntityActionContext): void | Promise<void>;
  public abstract onContextMenuOpen(context: CatalogEntityContextMenuContext): void | Promise<void>;
  public abstract onSettingsOpen(context: CatalogEntitySettingsContext): void | Promise<void>;
}
