/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Environments, getEnvironmentSpecificLegacyGlobalDiForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import type { CatalogEntityContextMenuContext, CatalogEntityMetadata, CatalogEntityStatus } from "../catalog";
import { CatalogCategory, CatalogEntity, categoryVersion } from "../catalog/catalog-entity";
import productNameInjectable from "../vars/product-name.injectable";
import weblinkStoreInjectable from "../weblinks-store/weblink-store.injectable";

export type WebLinkStatusPhase = "available" | "unavailable";

export interface WebLinkStatus extends CatalogEntityStatus {
  phase: WebLinkStatusPhase;
}

export interface WebLinkSpec {
  url: string;
}

export class WebLink extends CatalogEntity<CatalogEntityMetadata, WebLinkStatus, WebLinkSpec> {
  public static readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public static readonly kind = "WebLink";

  public readonly apiVersion = WebLink.apiVersion;
  public readonly kind = WebLink.kind;

  async onRun() {
    window.open(this.spec.url, "_blank");
  }

  onContextMenuOpen(context: CatalogEntityContextMenuContext) {
    // NOTE: this is safe because `onContextMenuOpen` is only supposed to be called in the renderer
    const di = getEnvironmentSpecificLegacyGlobalDiForExtensionApi(Environments.renderer);
    const productName = di.inject(productNameInjectable);
    const weblinkStore = di.inject(weblinkStoreInjectable);

    if (this.metadata.source === "local") {
      context.menuItems.push({
        title: "Delete",
        icon: "delete",
        onClick: async () => weblinkStore.removeById(this.getId()),
        confirm: {
          message: `Remove Web Link "${this.getName()}" from ${productName}?`,
        },
      });
    }
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
      categoryVersion("v1alpha1", WebLink),
    ],
    names: {
      kind: "WebLink",
    },
  };
}
