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

import { computed } from "mobx";
import URLParse from "url-parse";
import type { CatalogEntityMetadata } from "../../common/catalog";
import type { WebLinkSpec } from "../../common/catalog-entities";
import { CatalogCategoryRegistry, CatalogEntity } from "../catalog";

function isValid(url: string): boolean {
  try {
    new URLParse(url);

    return true;
  } catch {
    return false;
  }
}

export function initCatalogCategories() {
  // KubernetesCluster is done in "cluster-manager.ts"

  CatalogCategoryRegistry.getInstance().add({
    apiVersion: "catalog.k8slens.dev/v1alpha1",
    kind: "WebLink",
    metadata: {
      name: "Web Links",
    },
    spec: {
      group: "entity.k8slens.dev",
      versions: [
        {
          version: "v1alpha1",
          getStatus: (entity: CatalogEntity<CatalogEntityMetadata, WebLinkSpec>) => computed(() => ({
            phase: isValid(entity.spec.url) ? "valid" : "invalid",
          })),
        }
      ],
      names: {
        kind: "WebLink"
      }
    }
  });
}
