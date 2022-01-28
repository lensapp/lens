/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import EventEmitter from "events";
import type TypedEmitter from "typed-emitter";
import { observable, makeObservable } from "mobx";
import { once } from "lodash";
import { iter, Disposer } from "../utils";
import type { CategoryColumnRegistration } from "../../renderer/components/+catalog/custom-category-columns";

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
  /**
   * The specific version that the associated constructor is for. This MUST be
   * a DNS label and SHOULD be of the form `vN`, `vNalphaY`, or `vNbetaY` where
   * `N` and `Y` are both integers greater than 0.
   *
   * Examples: The following are valid values for this field.
   * - `v1`
   * - `v1beta1`
   * - `v1alpha2`
   * - `v3beta2`
   */
  name: string;

  /**
   * The constructor for the entities.
   */
  entityClass: CatalogEntityConstructor<Entity>;
}

export interface CatalogCategorySpec {
  /**
   * The grouping for for the category. This MUST be a DNS label.
   */
  group: string;

  /**
   * The specific versions of the constructors.
   *
   * NOTE: the field `.apiVersion` after construction MUST match `{.group}/{.versions.[] | .name}`.
   * For example, if `group = "entity.k8slens.dev"` and there is an entry in `.versions` with
   * `name = "v1alpha1"` then the resulting `.apiVersion` MUST be `entity.k8slens.dev/v1alpha1`
   */
  versions: CatalogCategoryVersion<CatalogEntity>[];

  /**
   * This is the concerning the category
   */
  names: {
    /**
     * The kind of entity that this category is for. This value MUST be a DNS
     * label and MUST be equal to the `kind` fields that are produced by the
     * `.versions.[] | .entityClass` fields.
     */
    kind: string;
  };

  /**
   * These are the columns used for displaying entities when in the catalog.
   *
   * If this is not provided then some default columns will be used, similar in
   * scope to the columns in the "Browse" view.
   *
   * Even if you provide columns, a "Name" column will be provided as well with
   * `priority: 0`.
   *
   * These columns will not be used in the "Browse" view.
   */
  displayColumns?: CategoryColumnRegistration[];
}

/**
 * If the filter return a thruthy value, the menu item is displayed
 */
export type AddMenuFilter = (menu: CatalogEntityAddMenu) => any;

export interface CatalogCategoryEvents {
  /**
   * This event will be emitted when the category is loaded in the catalog
   * view.
   */
  load: () => void;

  /**
   * This event will be emitted when the catalog add menu is opened and is the
   * way to added entries to that menu.
   */
  catalogAddMenu: (context: CatalogEntityAddMenuContext) => void;

  /**
   * This event will be emitted when the context menu for an entity is declared
   * by this category is opened.
   */
  contextMenuOpen: (entity: CatalogEntity, context: CatalogEntityContextMenuContext) => void;
}

export abstract class CatalogCategory extends (EventEmitter as new () => TypedEmitter<CatalogCategoryEvents>) {
  /**
   * The version of category that you are wanting to declare.
   *
   * Currently supported values:
   *
   * - `"catalog.k8slens.dev/v1alpha1"`
   */
  abstract readonly apiVersion: string;

  /**
   * The kind of item you wish to declare.
   *
   * Currently supported values:
   *
   * - `"CatalogCategory"`
   */
  abstract readonly kind: string;

  /**
   * The data about the category itself
   */
  abstract readonly metadata: {
    /**
     * The name of your category. The category can be searched for by this
     * value. This will also be used for the catalog menu.
     */
    name: string;

    /**
     * Either an `<svg>` or the name of an icon from {@link IconProps}
     */
    icon: string;
  };

  /**
   * The most important part of a category, as it is where entity versions are declared.
   */
  abstract spec: CatalogCategorySpec;

  /**
   * @internal
   */
  protected filters = observable.set<AddMenuFilter>([], {
    deep: false,
  });

  /**
   * Parse a category ID into parts.
   * @param id The id of a category is parse
   * @returns The group and kind parts of the ID
   */
  public static parseId(id: string): { group?: string, kind?: string } {
    const [group, kind] = id.split("/") ?? [];

    return { group, kind };
  }

  /**
   * Get the ID of this category
   */
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
  shortName?: string;
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
  /**
   * The group and version of this class.
   */
  public abstract readonly apiVersion: string;

  /**
   * A DNS label name of the entity.
   */
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

  /**
   * Get the UID of this entity
   */
  public getId(): string {
    return this.metadata.uid;
  }

  /**
   * Get the name of this entity
   */
  public getName(): string {
    return this.metadata.name;
  }

  /**
   * Get the specified source of this entity, defaulting to `"unknown"` if not
   * provided
   */
  public getSource(): string {
    return this.metadata.source ?? "unknown";
  }

  /**
   * Get if this entity is enabled.
   */
  public isEnabled(): boolean {
    return this.status.enabled ?? true;
  }

  public onRun?(context: CatalogEntityActionContext): void;
  public onContextMenuOpen?(context: CatalogEntityContextMenuContext): void;
  public onSettingsOpen?(context: CatalogEntitySettingsContext): void;
}
