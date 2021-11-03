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

import { navigate } from "../../renderer/navigation";
import { CatalogCategory, CatalogEntity, CatalogEntityMetadata, CatalogEntitySpec, CatalogEntityStatus } from "../catalog";
import { catalogCategoryRegistry } from "../catalog/catalog-category-registry";

interface GeneralEntitySpec extends CatalogEntitySpec {
  path: string;
  icon?: {
    material?: string;
    background?: string;
  };
}

export class GeneralEntity extends CatalogEntity<CatalogEntityMetadata, CatalogEntityStatus, GeneralEntitySpec> {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "General";

  async onRun() {
    navigate(this.spec.path);
  }

  public onSettingsOpen(): void {
    return;
  }

  public onDetailsOpen(): void {
    return;
  }

  public onContextMenuOpen(): void {
    return;
  }
}

export class GeneralCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "General",
    icon: "settings",
  };
  public spec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: GeneralEntity,
      },
    ],
    names: {
      kind: "General",
    },
  };
}

catalogCategoryRegistry.add(new GeneralCategory());
