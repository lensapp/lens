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

import { observable, when } from "mobx";
import { disposer, Disposer } from "../../common/utils";
import { parseApiVersion, CatalogCategoryRegistry as CommonCatalogCategoryRegistry } from "../../common/catalog";
import type { AddMenuEntry, CatalogEntity, MenuEntry, SettingsMenu } from "./catalog-entity";
import { CatalogCategoryRegistration, CatalogHandler, CategoryHandlerNames, CategoryHandlers, EntityContextHandlers, EntityContexts, Filtered, GlobalContextHandlers, GlobalContexts, Handlers } from "./catalog-categories";
import { once } from "lodash";
import { ConfirmDialog } from "../components/confirm-dialog";

export interface CatalogCategory extends CatalogCategoryRegistration {
  handlers: Handlers,
}

export type TransformedMenuItem = ReturnType<typeof tranformations["onContextMenuOpen"]>;
export type TransformedSettingsMenu = ReturnType<typeof tranformations["onSettingsOpen"]>;

function getOnClick(raw: Omit<MenuEntry, "onlyVisibleForSource">): () => void {
  if (raw.confirm) {
    return () => ConfirmDialog.open({
      okButtonProps: {
        primary: false,
        accent: true,
      },
      ok: raw.onClick,
      message: raw.confirm.message
    });
  }

  return raw.onClick;
}

const tranformations = {
  onContextMenuOpen: (entity: CatalogEntity, raw: MenuEntry) => {
    if (raw.onlyVisibleForSource && raw.onlyVisibleForSource === entity.metadata.source) {
      return null;
    }

    return {
      title: raw.title,
      onClick: getOnClick(raw),
    };
  },
  onSettingsOpen: (entity: CatalogEntity, raw: SettingsMenu) => raw,
  onCatalogAddMenu: (raw: AddMenuEntry) => ({
    title: raw.title,
    onClick: getOnClick(raw),
  })
};

export class CatalogCategoryRegistry extends CommonCatalogCategoryRegistry<CatalogCategoryRegistration, CatalogCategory> {
  protected register(registration: CatalogCategoryRegistration): CatalogCategory {
    return {
      handlers: {
        onCatalogAddMenu: observable.set(),
        onContextMenuOpen: observable.set(),
        onSettingsOpen: observable.set(),
      },
      ...registration
    };
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
          () => this.hasForGroupKind(group, version, kind),
          () => {
            this.groupVersionKinds
              .get(group)
              .get(version)
              .get(kind)
              .handlers[handlerName].add(handler as any);
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

  runEntityHandlersFor(entity: CatalogEntity, handlerName: "onContextMenuOpen"): ReturnType<typeof tranformations[typeof handlerName]>[];
  runEntityHandlersFor(entity: CatalogEntity, handlerName: "onSettingsOpen"): ReturnType<typeof tranformations[typeof handlerName]>[];
  runEntityHandlersFor(entity: CatalogEntity, handlerName: EntityContextHandlers): ReturnType<Filtered<CategoryHandlers[typeof handlerName]>> {
    const category = this.getRegistered(entity.apiVersion, entity.kind);
    const res = [];

    for (const handler of category.handlers[handlerName].values()) {
      const items = (handler as any)(entity, ...EntityContexts[handlerName]());

      for (const item of items) {
        if (!item) {
          continue;
        }

        const transformed = tranformations[handlerName](entity, item);

        if (transformed) {
          continue;
        }

        res.push(transformed as any);
      }
    }

    return res;
  }

  runGlobalHandlersFor({ spec }: CatalogCategoryRegistration, handlerName: "onCatalogAddMenu"): ReturnType<CategoryHandlers[typeof handlerName]>;
  runGlobalHandlersFor({ spec }: CatalogCategoryRegistration, handlerName: GlobalContextHandlers): ReturnType<CategoryHandlers[typeof handlerName]> {
    const category = this.getRegistered(spec.group, spec.names.kind);
    const res: ReturnType<Filtered<CategoryHandlers[typeof handlerName]>> = [];

    for (const handler of category.handlers[handlerName].values()) {
      const items = (handler as any)(...GlobalContexts[handlerName]());

      for (const item of items) {
        if (!item) {
          continue;
        }

        const transformed = tranformations[handlerName](item);

        if (transformed) {
          continue;
        }

        res.push(transformed as any);
      }
    }

    return res;
  }
}
