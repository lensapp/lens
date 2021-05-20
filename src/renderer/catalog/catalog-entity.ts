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

import { navigate } from "../navigation";
import { commandRegistry } from "../../extensions/registries";
import type { CatalogEntityKindData, CatalogEntityMetadata, CatalogEntitySpec, CatalogEntityStatus } from "../../common/catalog";
import type { CatalogEntityData } from "./catalog-categories";

export type { CatalogEntityKindData } from "../../common/catalog";

export const catalogEntityRunContext = {
  navigate: (url: string) => navigate(url),
  setCommandPaletteContext: (entity?: CatalogEntity) => {
    commandRegistry.activeEntity = entity;
  }
};

export interface CatalogEntityActionContext {
  navigate: (url: string) => void;
  setCommandPaletteContext: (context?: CatalogEntity) => void;
}

export interface MenuEntry {
  title: string;
  onlyVisibleForSource?: string; // show only if empty or if matches with entity source
  onClick: () => void | Promise<void>;
  confirm?: {
    message: string;
  }
}

export interface AddMenuEntry extends Omit<MenuEntry, "onlyVisibleForSource"> {
  icon: string;
}

export interface CatalogEntitySettingsMenu {
  group?: string;
  title: string;
  components: {
    View: React.ComponentType<any>
  };
}

export interface MenuContext {
  navigate: (url: string) => void;
}

export type OnContextMenuOpen = (ctx: MenuContext) => MenuEntry[];
export type OnAddMenuOpen = (ctx: MenuContext) => AddMenuEntry[];

export type CategoryHandler<EntityHandler extends (...args: any[]) => any> = (entity: CatalogEntity, ...args: Parameters<EntityHandler>) => ReturnType<EntityHandler>;

export interface SettingsContext {
}

export interface SettingsMenu {
  group?: string;
  title: string;
  components: {
    View: React.ComponentType<any>
  };
}

export type OnSettingsOpen = (ctx: SettingsContext) => SettingsMenu[];

function deepFreeze(o: any) {
  Object.freeze(o);

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (o.hasOwnProperty(prop)
      && o[prop] !== null
      && (typeof o[prop] === "object" || typeof o[prop] === "function")
      && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });

  return o;
}

export class CatalogEntity<
  Metadata extends CatalogEntityMetadata = CatalogEntityMetadata,
  Status extends CatalogEntityStatus = CatalogEntityStatus,
  Spec extends CatalogEntitySpec = CatalogEntitySpec,
> implements CatalogEntityKindData {
  readonly metadata: Metadata;
  readonly status: Status;
  readonly spec: Spec;
  readonly id: string;
  readonly name: string;
  readonly apiVersion: string;
  readonly kind: string;

  constructor(data: CatalogEntityData<Metadata, Status, Spec>) {
    // This is done to prevent users from mistaking that they can overright these values to "save" them
    this.metadata = deepFreeze(data.metadata);
    this.status = deepFreeze(data.status);
    this.spec = deepFreeze(data.spec);
    this.id = this.metadata.uid;
    this.name = this.metadata.name;
  }

  onRun?(context: CatalogEntityActionContext): void;
}
