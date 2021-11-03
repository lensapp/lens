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

import { CatalogCategory, CatalogEntity, CatalogEntityAddMenuContext, CatalogEntityContextMenuContext, CatalogEntityMetadata, CatalogEntityStatus } from "../catalog";
import { catalogCategoryRegistry } from "../catalog/catalog-category-registry";
import { productName } from "../vars";
import { WeblinkStore } from "../weblink-store";

export type WebLinkStatusPhase = "available" | "unavailable";

export interface WebLinkStatus extends CatalogEntityStatus {
  phase: WebLinkStatusPhase;
}

export type WebLinkSpec = {
  url: string;
};

export class WebLink extends CatalogEntity<CatalogEntityMetadata, WebLinkStatus, WebLinkSpec> {
  public static readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public static readonly kind = "WebLink";

  public readonly apiVersion = WebLink.apiVersion;
  public readonly kind = WebLink.kind;

  async onRun() {
    window.open(this.spec.url, "_blank");
  }

  public onSettingsOpen(): void {
    return;
  }

  async onContextMenuOpen(context: CatalogEntityContextMenuContext) {
    if (this.metadata.source === "local") {
      context.menuItems.push({
        title: "Delete",
        icon: "delete",
        onClick: async () => WeblinkStore.getInstance().removeById(this.metadata.uid),
        confirm: {
          message: `Remove Web Link "${this.metadata.name}" from ${productName}?`,
        },
      });
    }

    catalogCategoryRegistry
      .getCategoryForEntity<WebLinkCategory>(this)
      ?.emit("contextMenuOpen", this, context);
  }
}

export class WebLinkCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "Web Links",
    icon: "public",
  };
  public spec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: WebLink,
      },
    ],
    names: {
      kind: "WebLink",
    },
  };
  public static onAdd?: () => void;

  constructor() {
    super();

    this.on("catalogAddMenu", (ctx: CatalogEntityAddMenuContext) => {
      ctx.menuItems.push({
        icon: "public",
        title: "Add web link",
        onClick: () => {
          WebLinkCategory.onAdd();
        },
      });
    });
  }
}

catalogCategoryRegistry.add(new WebLinkCategory());
