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

import { CatalogCategory, CatalogEntity, CatalogEntityContextMenuContext, CatalogEntityMetadata, CatalogEntityStatus } from "../catalog";
import { catalogCategoryRegistry } from "../catalog/catalog-category-registry";

export interface HelmRepositoryStatus extends CatalogEntityStatus {
  phase: "available" | "unavailable";
}

export type HelmRepositorySpec = {
  url: string;
  id?: string;
  digest?: string;
  cacheFilePath?: string
  caFile?: string,
  certFile?: string,
  insecureSkipTlsVerify?: boolean,
  keyFile?: string,
  username?: string,
  password?: string,
  icon?: {
    src: string
  }
};

export class HelmRepository extends CatalogEntity<CatalogEntityMetadata, HelmRepositoryStatus, HelmRepositorySpec> {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "HelmRepository";

  async onRun() {
    window.open(this.spec.url, "_blank");
  }

  public onSettingsOpen(): void {
    return;
  }

  async onContextMenuOpen(context: CatalogEntityContextMenuContext) {
    // todo
  }
}

export class HelmRepositoryCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "Helm Repositories",
    icon: "apps"
  };
  public spec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: HelmRepository
      }
    ],
    names: {
      kind: "HelmRepository"
    }
  };
}

catalogCategoryRegistry.add(new HelmRepositoryCategory());
